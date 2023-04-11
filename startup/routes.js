const auth = require('../routes/auth')
const users = require('../routes/users')

module.exports = function (app) {
    app.use('/api/auth', auth);
    app.use('/api/users', users);
}