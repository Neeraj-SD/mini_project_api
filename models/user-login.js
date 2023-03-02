const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);
const config = require('config');
const jwt = require('jsonwebtoken')


const userLoginJoiSchema = Joi.object({
    email: Joi.string().required().max(50).min(5),
    uid:Joi.string().required(),
});


const userLoginMongooseSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        maxlength:50,
        unique:true,
        dropDups: true
    },
    uid:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
});

userLoginMongooseSchema.methods.generateJwtKey = function(){
    const token = jwt.sign({_id:this._id, email:this.email}, config.get('jwtPrivateKey'));
    return token;
}


module.exports.userLoginJoiSchema = userLoginJoiSchema;
module.exports.userLoginMongooseSchema = userLoginMongooseSchema;