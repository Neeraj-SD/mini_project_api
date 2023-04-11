const credentials = require("./credentials.json");
var admin = require("firebase-admin"); 0


console.log("Creating app")
const app = admin.initializeApp({
  credential: admin.credential.cert(credentials)
});
console.log("App created");
module.exports = app;