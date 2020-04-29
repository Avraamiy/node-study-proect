const {Router} = require('express')
const router = Router()
const auth = require('../middlerware/auth')
const User = require('../models/user')

router.get('/', auth, async (req, res) => {
    try {
        res.render('profile', {
            title: 'Profile',
            isProfile: true,
            user: req.user.toObject(),
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const toChange = {
          name: req.body.name
        }
        if(req.file) {
            toChange.imageUrl = req.file.path
        }

        Object.assign(user, toChange)
         await user.save()
        res.redirect('/profile')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router