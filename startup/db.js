const mongoose = require('mongoose');
const config = require('config');


module.exports = async function () {
    let conStr = config.get('dbConnectionString');
    // conStr = conStr.replace('<username>', config.get('mongoPass.username'));
    // conStr = conStr.replace('<password>', config.get('mongoPass.password'));
    conStr = conStr.replace('<password>', 'FD9PQ6eKd4BtrgMm');

    const db = await mongoose.connect(conStr, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('Connected to database...'));
}