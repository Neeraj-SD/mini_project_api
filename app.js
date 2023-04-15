const express = require('express');
const config = require('config')

const jwt = require('jsonwebtoken')

const app = express();
app.use(express.json());



const http = require('http');
// const server = http.createServer(app);


require('./startup/routes')(app);
require('./startup/db')();
// const firebase_configuration = require('./startup/firebase-configuration');
const { User } = require('./models/user');


if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR JWT PRIVATE KEY IS NOT DEFINED')
    process.exit(1)
}

const PORT = process.env.PORT || 3001;

// const server = app.listen(PORT, () => console.log("Listening on port " + PORT));

const server = app.listen(PORT, () => console.log("Listening on port " + PORT));

// io.on('disconnection', socket => console.log('Disconnected'))


module.exports = server;