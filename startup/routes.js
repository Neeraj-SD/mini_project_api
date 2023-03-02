const achievements = require('../routes/achievements');
const auth = require('../routes/auth');
const chats = require('../routes/chats');
const communities = require('../routes/communities');
const events = require('../routes/events');
const feed = require('../routes/feed');
const posts = require('../routes/posts');
const promotions = require('../routes/promotions');
const trending = require('../routes/trending');
const users = require('../routes/users');
const eventTypes = require('../routes/eventTypes');
const skills = require('../routes/skills')

const imageUpload = require('../routes/image-upload-test');
const search = require('../routes/search');
const report = require('../routes/report');

module.exports = function(app){
    app.use('/api/achievements', achievements);
    app.use('/api/auth', auth);
    app.use('/api/chats', chats);
    app.use('/api/communities', communities);
    app.use('/api/events', events);
    app.use('/api/feed', feed);
    app.use('/api/posts', posts);
    app.use('/api/promotions', promotions);
    app.use('/api/trending', trending);
    app.use('/api/users', users);
    app.use('/api/event-types',eventTypes);
    app.use('/api/search', search);
    app.use('/api/report', report);

    app.use('/api/image-upload', imageUpload);
    app.use('/api/skills',skills);
}
