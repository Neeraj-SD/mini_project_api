const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);
const jwt = require('jsonwebtoken');
const config = require('config');



const userJoiSchema = Joi.object({
    email: Joi.string().required().max(50).min(5),
    userName: Joi.string().required().max(20).min(3),
    name: Joi.string().required().max(20).min(3),
    skills: Joi.array().items(Joi.objectId()),
    bio:Joi.string().max(100),
    fileType:Joi.string().min(2).max(5),
    uid:Joi.string()
});


const userMongooseSchema = new mongoose.Schema({
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
    created:{
        type:Date,
        default:Date.now
    },
    userName:{
        type:String,
        maxlength:20,
        minlength:3,
        required:true,
        unique:true,
        dropDups: true
    },
    name:{
        type:String,
        maxlength:20,
        minlength:3,
        required:true
    },
    image:{
        type:String,
    },
    coverImage:{
        type:String,
    },
    bio:{
        type:String,
        maxlength:100,
    },
    skills:[
        {
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:'Skill'
        }
    ],
    blocked:[
        {
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:'User'
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:'User'
        }
    ],
    communities:[
        {
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:'Community'
        }
    ],
    achievements:[
        {
            type:mongoose.Schema.Types.ObjectId,
            require:true,
            ref:'Achievement'
        }
    ]
});

userMongooseSchema.methods.generateJwtKey = function(){
    const token = jwt.sign({_id:this._id, email:this.email}, config.get('jwtPrivateKey'));
    return token;
}

module.exports.userJoiSchema = userJoiSchema;
module.exports.userMongooseSchema = userMongooseSchema;
