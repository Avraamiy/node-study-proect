module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAutheticated
    res.locals.csrf = req.csrfToken()
    next()
}