const express = require('express')
const router = express.Router()

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

router.post('/', async (req, res) => {

    const { error, value } = validateUser(req.body)
    if (error) return res.status(400).send(error['details'][0]['message'])

    let user = await User.findOne({ email: value.email });
    if (user) return res.status(404).send('User already exists.');

    user = User({
        name: value.name,
        email: value.email,
        googleUid: 'Custom Created',
    })

    await user.save()

    res.status(201).send({ user, token: user.generateAuthToken() })

})

//TODO: Update profile
router.put('/', auth, async (req, res) => {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) res.status(404).send('User not found');

})

module.exports = router;