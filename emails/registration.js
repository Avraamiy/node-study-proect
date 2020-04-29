const keys = require('../keys/index')

module.exports = function(email) {
    return {
        to: email,
        from: keys.FROM_EMAIL,
        subject: "Create Account!",
        html: ` 
        <h1>Hello! You have successfully created an account in the Courses Store</h1>
        <hr>
         <p>Go to the Store: <a href="${keys.BASE_URL}">Courses Store</a></p>
        `
    }
}
