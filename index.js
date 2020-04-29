const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const addRouters = require('./routes/add')
const homeRouters = require('./routes/home')
const coursesRouters = require('./routes/courses')
const cartRouters = require('./routes/cart')
const ordersRouters = require('./routes/orders')
const authRouters = require('./routes/auth')
const profileRouters = require('./routes/profile')
const mongoose = require('mongoose')
const compression = require('compression')
const helmet = require('helmet')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const keys = require('./keys/index')
const errorMiddleware = require('./middlerware/error')
const fileMiddleware = require('./middlerware/file')

const varMiddleware = require('./middlerware/variables')
const userMiddleware = require('./middlerware/user')

const app = express()

const store = new MongoStore({
    collection: 'session',
    uri: keys.MONGODB_URI
})

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images',express.static(path.join((__dirname), 'images')))
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: keys.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    store,
}))

app.use(fileMiddleware.single('avatar'))

app.use(csrf())
app.use(varMiddleware)
app.use(userMiddleware)
app.use(flash())
app.use(helmet())
app.use(compression())

app.use('/add', addRouters)
app.use('/', homeRouters)
app.use('/courses', coursesRouters)
app.use('/cart', cartRouters)
app.use('/orders', ordersRouters)
app.use('/auth', authRouters)
app.use('/profile', profileRouters)

app.use(errorMiddleware)

const PORT = process.env.PORT || 3000

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}... `)
        })
    } catch (e) {
        console.log(e)
    }
}

start()

// console.log(process.env)

