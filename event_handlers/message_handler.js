const { Message } = require('../models/message')
const { User } = require('../models/user')

const admin = require('../startup/firebase-configuration')


//! FCM SEND MESSAGE
const sendNotification = async (message, user) => {
    try {
        const registrationToken = user.fcmToken;
        // const registrationToken = 'dM7UYYN4Ro-3SP_rDy71wD:APA91bHEYSFyLB_hlbA70XGT0y-iuvHA7eY4nDyeA7KL0Y0m_JbbySwuYom02tbLU9H_wHYxH4r0qBNKpcb4_VwlHz6Cli8_soIfs7AAd1XAllozmCQwct5KQZyTa35AdHjY6Mm9kiry';


        // const payload = {
        //     notification: {
        //         body: message.body
        //     }
        // };

        const payload = {
            notification: {
                body: message.body,
                title: user.name,
            }
        }

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


module.exports = (io, socket) => {
    const sendMessage = async (payload, callback) => {
        payload = JSON.parse(payload)
        console.log(payload)

        const message = new Message({
            body: payload.body,
            _from: socket.user.id,
            _to: payload.to,
        })

        await message.save();

        const user = await User.findById(payload.to)

        const result = await io.to(user.socket_id).emit('chat', message)
        sendNotification(message, user)
        console.log(message.toJSON())

        callback(message)
    }


    const deliveredChat = async (chatId, callback) => {
        const chat = await Message.findById(chatId)
        await chat.delete();
    }

    const unread = async (_, callback) => {
        const chats = await Message.find({ _to: socket.user.id })
        const user = await User.findById(socket.user.id)

        chats.map(chat => io.to(user.socket_id).emit('chat', chat))
    }

    socket.on('send-chat', sendMessage)
    socket.on('chat:delivered', deliveredChat)
    socket.on('chat:unread', unread)
}