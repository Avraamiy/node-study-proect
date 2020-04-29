const {Router} = require('express')
const router = Router()
const Course = require('../models/course')
const auth = require('../middlerware/auth')

const mapCartItems = (cart) => {
    return cart.items.map(c => ({
        ...c.courseId._doc,
        count: c.count,
        id: c.courseId._id,
    }))
}
const computePrice = (courses) => {
    return courses.reduce((total, course) => {
       return total += course.price * course.count
    }, 0)
}
router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course)
    res.redirect('/cart')
})

router.put('/add/:id', auth, async (req, res) => {
    const course = await Course.findById(req.params.id)
    await req.user.addToCart(course)
    const user =  await req.user.populate('cart.items.courseId').execPopulate()
    const courses = mapCartItems(user.cart)
    const cart = {
        courses, price: computePrice(courses),
    }
    res.status(200).json(cart)
})

router.delete('/remove/:id', auth, async (req, res) => {

    await req.user.removeFromCart(req.params.id)

    const user = await req.user.populate('cart.items.courseId').execPopulate()

    const courses = mapCartItems(user.cart)

    const cart = {
        courses, price: computePrice(courses),
    }
    res.status(200).json(cart)
})

router.get('/', auth, async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate()

    const courses = mapCartItems(user.cart)
    res.render('cart', {
        title: 'Cart',
        courses,
        price: computePrice(courses),
        isCart: true,
    })
})

module.exports = router