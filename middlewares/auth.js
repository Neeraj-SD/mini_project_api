const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose =  require('mongoose');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const User = mongoose.model("User", userMongooseSchema);


async function auth(req, res, next){
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied');

    try{
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        
        req.user = {
            id:decoded._id,
            email:decoded._email
        };

        req.user.user = await User.findById(decoded._id);

        if(!req.user.user) return res.status(401).send('User not found, access denied');
        
        next();
    }
    catch(ex){
        return res.status(400).send('Invalid Token');
    }
}

module.exports = auth;