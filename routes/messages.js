const express = require('express');
const admin = require('../startup/firebase-configuration')
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');
const { User } = require('../models/user');
const { Message, validate } = require('../models/message');
const { publishMessage } = require('../startup/redis-client');
const router = express.Router();

//! FCM SEND MESSAGE

const sendNotification = async (message, user) => {
    try {
        const registrationToken = user.fcmToken;
        // const registrationToken = 'dM7UYYN4Ro-3SP_rDy71wD:APA91bHEYSFyLB_hlbA70XGT0y-iuvHA7eY4nDyeA7KL0Y0m_JbbySwuYom02tbLU9H_wHYxH4r0qBNKpcb4_VwlHz6Cli8_soIfs7AAd1XAllozmCQwct5KQZyTa35AdHjY6Mm9kiry';


        const payload = {
            notification: {
                body: message.body
            }
        };

        admin.messaging().sendToDevice(registrationToken, payload)
            .then((response) => {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    } catch (e) {
        console.log(e)
    }
}



//!

const sendRedisMessage = async (message, user) => {
    //TODO: Create new Redis-Channel-ID
    //TODO: Delete message after the client recieves it
    const recieved = await publishMessage(message, user.id);
    sendNotification(message, user);
    console.log('received:' + recieved + user.id)
    if (recieved > 0) {
        message.status = 'delivered';
        await message.delete();
        console.log('Client recieved message');
    } else {
        console.log('Client did not receive message');
    }
}

router.post('/send/:id', [auth, validObjectId('id')], async (req, res) => {
    const toUserId = req.params.id;

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).send("User not found");

    const { value, error } = validate(req.body);
    if (error) return res.status(400).send(error);

    const message = new Message({
        body: value.body,
        _from: req.user.id,
        _to: toUserId,
    });

    await message.save();
    sendRedisMessage(message, toUser)
    return res.status(201).send(message);
});

router.post('/test/send/:id', async (req, res) => {
    const toUserId = req.params.id;

    sendNotification();

    return res.send(200)

    // const toUser = await User.findById(toUserId);
    // if (!toUser) return res.status(404).send("User not found");

    // const { value, error } = validate(req.body);
    // if (error) return res.status(400).send(error);

    // const message = new Message({
    //     body: value.body,
    //     _from: 'from',
    //     _to: toUserId,
    // });

    // await message.save();
    // sendRedisMessage(message, toUserId)
    // return res.status(201).send(message);
});

router.get('/unread', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const messages = await Message.find({ _to: req.user.id });

    messages.forEach(x => {
        sendRedisMessage(x, user)
    })

    return res.status(200).send(messages);
});

router.get('/chat/:id', [auth, validObjectId('id')], async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    console.log(`from ${user._id} to ${req.user.id}`)

    const messages = await Message
        .find({ _from: user._id, _to: req.user.id })

    messages.forEach(x => {
        x.status = 'delivered'
        x.save();
    })

    return res.status(200).send(messages);
});




module.exports = router;