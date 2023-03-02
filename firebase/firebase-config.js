var admin = require("firebase-admin");
var serviceAccount = require("../cambuzz-dbdc3-firebase-adminsdk-mq4wa-9e222cadfe.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
module.exports = admin;
  