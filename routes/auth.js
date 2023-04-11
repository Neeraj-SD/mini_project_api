const express = require('express');
const o_auth = require('../middlewares/o_auth');
const router = express.Router()
const _ = require('lodash');
const { validate, User } = require('../models/user');
const { UserAvatar } = require('../models/user/user-avatar');
const bcrypt = require('bcryptjs/dist/bcrypt');

// router.post('/register', o_auth, async (req, res) => {
//     // const { error, value } = validate(req.body);
//     // if (error) return res.status(400).send(error);

//     const user = new User({
//         google_uid: req.userid,
//         email: req.email,
//         name: req.name,
//         picture: req.picture,
//     })

//     await user.save()

//     const salt = await bcrypt.genSalt(10);
//     const hashed_google_uid = await bcrypt.hash(req.userid, salt);
//     await user.updateOne({ google_uid: hashed_google_uid })
//     const result = await user.save()

//     res.header('x-auth-token', result.generateAuthToken()).status(201).send(await result.getAnonymousUser())
// });

router.post('/google', o_auth, async (req, res) => {
    // const { error, value } = validate(req.body);
    // if (error) return res.status(400).send(error);

    let user = await User.findOne({ email: req.email });
    if (user) return res.header().status(200).send(await user.getAnonymousUser())

    user = new User({
        google_uid: req.userid,
        email: req.email,
        name: req.name,
        picture: req.picture,
    })

    await user.save()

    const salt = await bcrypt.genSalt(10);
    const hashed_google_uid = await bcrypt.hash(req.userid, salt);
    await user.updateOne({ google_uid: hashed_google_uid })
    const result = await user.save()

    res.header('x-auth-token', result.generateAuthToken()).status(201).send(await result.getAnonymousUser())
});

router.post('/login', o_auth, async (req, res) => {
    const user = await User.findOne({ email: req.email });
    if (!user) return res.status(404).send("User not found");


    // const validGoogleUid = await bcrypt.compare(req.userid, user.google_uid)
    // if (!validGoogleUid) return res.status(403).send('Invalid credentials.')

    res.header().status(200).send(await user.getAnonymousUser())

})

module.exports = router;