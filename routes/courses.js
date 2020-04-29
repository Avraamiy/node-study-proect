const {Router} = require('express')
const router = Router()
const auth = require('../middlerware/auth')
const Course = require('../models/course')
const {addValidators} = require('../utils/validators')
const {validationResult} = require('express-validator')

function isOwner(course, req) {
    return course.userId._id.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .lean().populate('userId', 'name')

        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            courses,
            userId: req.user ? req.user._id.toString() : null,
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    try {
        if (!req.query.allow) {
            return res.redirect('/')
        }

        const course = await Course.findById(req.params.id).lean()

        if (!isOwner(course, req)) {
            res.redirect('/courses')
        } else {
            res.render('course-edit', {
                course,
                title: `Edit ${course.title}`
            })
        }
    } catch (e) {
        console.log(e)
    }

})

router.post('/edit', addValidators, auth, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).render('course-edit', {
                course: {
                    title: req.body.title,
                    price: req.body.price,
                    img: req.body.img,
                    _id: req.body.id,
                },
                title: `Edit ${req.body.title}`,
                error: errors.array()[0].msg,
            })
        }

        const {id} = req.body
        delete req.body.id
        const course = await Course.findById(id)
        if (!isOwner(course, req)) {
            res.redirect('/courses')
        } else {
            Object.assign(course, req.body)
            await course.save()
            res.redirect('/courses')
        }
    } catch (e) {
        console.log(e)
    }

})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean()

        res.render('course', {
            layout: 'empty',
            title: course.title,
            course
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
    } catch (e) {
        console.log(e)
    }
    res.redirect('/courses')
})

module.exports = router