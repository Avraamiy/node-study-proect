const keys = require('../keys/index')

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.FROM_EMAIL,
        subject: "Password recovery",
        html: ` 
        <h1>Hello! You forgot password?</h1>
        <p> If not, ignore this email.</p>
        <p> If Yes, follow the <a href="${keys.BASE_URL}/auth/password/${token}">link</a> to restore your password</p>
        <hr>
        <p>Go to the Store: <a href="${keys.BASE_URL}">Courses Store</a></p>
        `
    }
}
