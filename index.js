const express = require('express');
require('./firebase/firebase-config');
const app = express();
app.use(express.json());




require('./startup/routes')(app);
require('./startup/db')();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, ()=> console.log("Listening on port "+PORT));

module.exports = server;