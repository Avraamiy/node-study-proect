const {Router} = require('express')
const router = Router()
const Orders = require('../models/orders')
const auth = require('../middlerware/auth')

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Orders.find({
            'user.userId': req.user._id
        }).populate('user.userId')

        res.render('orders', {
            title: 'Orders',
            isOrders: true,
            orders: orders.map(o => ({
                ...o._doc,
                price: o.courses.reduce((total, c) => {
                    return total += c.count * c.course.price
                }, 0)
            })),
        })
    } catch (e) {
        console.log(e)
    }

})

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.courseId').execPopulate()
        const courses = user.cart.items.map(i => ({
            course: {...i.courseId._doc},
            count: i.count,
        }))
        const order = new Orders({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses,
        })
        await order.save()
        await req.user.clearCart()
        res.redirect('/orders')
    } catch (e) {
        console.log(e)
    }

})

module.exports = router