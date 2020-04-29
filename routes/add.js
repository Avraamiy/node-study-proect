const {Router} = require('express')
const router = Router()
const Course = require('../models/course')
const auth = require('../middlerware/auth')
const {validationResult} = require('express-validator')
const {addValidators} = require('../utils/validators')

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Add Courses',
        isAdd: true,
    })
})

router.post('/', addValidators, auth, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).render('add', {
                title: 'Add Courses',
                isAdd: true,
                error: errors.array()[0].msg,
                data: {
                    title: req.body.title,
                    price: req.body.price,
                    img: req.body.img,
                }
            })
        }

        const course = new Course({
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
                userId: req.user,
            }
        )

        await course.save()
    } catch (e) {
        console.log(e)
    }
    res.redirect('/courses')
})

module.exports = router