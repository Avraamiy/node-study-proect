const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email').isEmail().withMessage('Enter the correct email address!')
        .custom(async (value, {req}) => {
            const candidate = await User.findOne({email: value})
            if (candidate) {
                return Promise.reject('A user with that email address already exists!')
            }
        })
        .normalizeEmail(),
    body('password', 'The password must contain at least 6 characters!')
        .isLength({min: 6, max: 32}).isAlphanumeric(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Password must match!')
            }
            return true
        }),
    body('name')
        .isLength({min: 3, max: 16}).withMessage('The name must contain at least 3 characters!')
        .trim()
]

exports.loginValidators = [
    body('email').isEmail().withMessage('Enter the correct email address!')
        .custom(async (value, {req}) => {
            const candidate = await User.findOne({email: value})
            if (!candidate) {
                return Promise.reject('There are no users with this emails address!')
            }
        }),
]

exports.passwordValidators = [
    body('password', 'The password must contain at least 6 characters!')
        .isLength({min: 6, max: 32}).isAlphanumeric(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Password must match!')
            }
            return true
        }),
]

exports.addValidators = [
    body('title').isLength({min: 3, max:32}).withMessage('The name must contain at least 3 characters!')
        .trim(),
    body('price').isNumeric().withMessage('Enter the correct price!'),
    body('img', 'Incorrect Url!').isURL().trim(),
]