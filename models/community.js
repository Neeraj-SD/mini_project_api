const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const communityJoiSchema = Joi.object({
    name:Joi.string().required().max(20).min(3),
    image:Joi.string(),
    coverImage:Joi.string(),
    fileType:Joi.string().required()
});

const communityMongooseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:20,
        minlength:3
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "User",
    },
    image:{
        type:String
    },
    coverImage:{
        type:String
    },
    members:[
        {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "User"
        }
    ],
    isSociety:{
        type:Boolean,
        default:false,
    },
    managers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "User"
        }
    ]
});

module.exports.communityJoiSchema = communityJoiSchema;
module.exports.communityMongooseSchema = communityMongooseSchema;
