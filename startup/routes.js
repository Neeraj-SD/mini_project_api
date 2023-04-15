const auth = require('../routes/auth')
const users = require('../routes/users')
const isAlive = require('../routes/alive')
const jobType = require('../routes/job_type')

module.exports = function (app) {
    app.use('/api/auth', auth);
    app.use('/api/users', users);
    app.use('/api/is-alive', isAlive);
    app.use('/api/job-types', jobType);
}