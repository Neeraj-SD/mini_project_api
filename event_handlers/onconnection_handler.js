const { User } = require('../models/user')

module.exports = (io, socket) => {
    const onconnection = async () => {
        const user = await User.findOne(socket.user)

        socket.join(user.id)

        console.log('a user connected', socket.id);
        socket.on('msg', (_) => console.log(_ + socket.id))
        io.to(user.id).emit('fromServer', 'Connected to server as' + socket.id)
    }

    socket.on("connection", onconnection);
}