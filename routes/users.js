const express = require('express')
const router = express.Router()

const messages = require('./messages');

router.use('/messages', messages);

const { User, validate: validateUser } = require('../models/user');
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');

router.get('/', auth, async (req, res) => {
    const user = await User
        .findById(req.user.id)

    if (!user) return res.status(404).send('User not found');

    res.status(200).send(await user.getAnonymousUser())

});

router.post('/fcmToken', auth, async (req, res) => {
    const user = await User
        .findById(req.user.id)

    if (!user) return res.status(404).send('User not found');

    if (!req.body.fcmToken || req.body.fcmToken.length < 3) return res.status(400).send('Send a valid fcm token.')

    user.fcmToken = req.body.fcmToken
    await user.save()

    return res.status(200).send(user.fcmToken)

});

router.get('/all', [auth,], async (req, res) => {
    const users = await User.find().select('-google_uid')
    res.send(users)
})

router.get('/:id', [auth, validObjectId('id')], async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) res.status(404).send('User not found');
    // await user.populate('avatar');

    res.status(200).send(await user.getAnonymousUser())
});

//TODO: Update profile
router.put('/', auth, async (req, res) => {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) res.status(404).send('User not found');

})

module.exports = router;