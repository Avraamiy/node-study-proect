const {Router} = require('express')
const router = Router()
const User = require('../models/user')
const {validationResult} = require('express-validator')
const {registerValidators, loginValidators, passwordValidators} = require('../utils/validators')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys/index')
const regEmail = require('../emails/registration')
const resPassword = require('../emails/reset')
const crypto = require('crypto')


const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGIRD_API_KEY}
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        isLogin: true,
        title: 'Log in',
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError'),
    })
})

router.get('/logout', async (req, res) => {

    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const {email, password} = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg)
            res.status(422).redirect('/auth/login#login')
        }
        const candidate = await User.findOne({email})
        const areSome = await bcrypt.compare(password, candidate.password)

        if (areSome) {
            req.session.user = candidate
            req.session.isAutheticated = true
            req.session.save(err => {
                if (err) throw err
                res.redirect('/')
            })
        } else {
            req.flash('loginError', 'Invalid password!')
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email,
            password: hashPassword,
            name,
            cart: {items: []},
        })

        await user.save()
        res.redirect('/auth/login#login')
        await transporter.sendMail(regEmail(email))
    } catch (e) {
        console.log(e)
    }

})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error'),
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'something went wrong, try again later!')
                res.redirect('/auth/login#login')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 3600 * 1000
                await candidate.save()
                await transporter.sendMail(resPassword(candidate.email, token))
                req.flash('loginError', 'Check your email!')
                res.redirect('/auth/login#login')
            } else {
                req.flash('error', 'No user with this email!')
                res.redirect('/auth/reset')
            }
        })
    } catch (e) {
        console.log(e)
    }

})

router.get('/password/:token', async (req, res) => {
    try {
        if (!req.params.token) {
            res.redirect('/auth/login#login')
        }
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {
                $gt: Date.now()
            }
        })
        if (user) {
            res.render('auth/password', {
                title: 'Restore account',
                userId: user._id.toString(),
                token: user.resetToken,
                error: req.flash('error')
            })
        } else {
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e)
    }

})

router.post('/password', passwordValidators, async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg)
           return res.status(422).redirect(`/auth/password/${req.body.token}`)
        }
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'a та тя!')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router