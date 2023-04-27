const CLIENT_ID = '436757224139-bur00h4v1dargisjqtrkbri6avcaleqp.apps.googleusercontent.com'
// AIzaSyChIFjZNuv2Is6KRpri1K5TfdKLJl0DlUE
const CLIENT_ID_APP = '965034065923-iu23iloodec65vm9g5ap7no5h9b7pka1.apps.googleusercontent.com'

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

module.exports = async function (req, res, next) {

    if (!req.header('x-auth-google-token'))
        return res.status(403).send('google token required')

    try {
        console.log(req.header('x-auth-google-token'))
        const ticket = await client.verifyIdToken({
            idToken: req.header('x-auth-google-token'),
            // idToken: id_token,
            // audience: [CLIENT_ID_APP],  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });

        const payload = ticket.getPayload();
        console.log(payload)
        const userid = payload['sub']
        const email = payload['email']
        const picture = payload['picture']
        const name = payload['name']

        req.name = name
        req.picture = picture
        req.userid = userid
        req.email = email

        next()

    } catch (err) {
        console.log(err)
        res.status(403).send('Invalid Token')
    }
}

// const {getAuth}  = require('firebase-admin/auth');
// const admin = require('firebase-admin');

// function auth(req, res, next) {

//   const idToken = req.headers['x-auth-google-token'];

//   admin.auth().verifyIdToken(idToken).then(data=>{
//     console.log(data);
//     req.profile_image = data.picture;
//     req.userid = data.uid;
//     req.email = data.email;
//     next();
//   }).catch(error=>{
//       console.log(error);
//   })

//   getAuth()
//   .verifyIdToken(idToken)
//   .then((decodedToken) => {
//     const uid = decodedToken.uid;
//     console.log(uid);
//     // ...
//   })
//   .catch((error) => {
//     res.status(403).send("Could not authenticate "+error)
//   });
// }

// module.exports = auth;