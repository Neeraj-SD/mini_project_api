const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const eventJoiSchema = Joi.object({
    title:Joi.string().min(3).max(20).required(),
    image:Joi.string(),
    time:Joi.string().required(),
    description:Joi.string().min(3).max(2000).required(),
    contact:Joi.string().min(3).max(20).required(),
    link:Joi.string().required(),
    fileType:Joi.string().required(),
    eventType:Joi.objectId().required(),
});

const eventMongooseSchema = new mongoose.Schema({
    community:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Community',
        required:true,
    },
    title:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20,
    },
    eventType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'EventType',
        required:true,
    },
    image:{
        type:String
    },
    time:{
        type:Date,
        default:Date.now,
        required:true,
    },
    description:{
        type:String,
        minlength:3,
        maxlength:2000,
        required:true,
    },
    contact:{
        type:String,
        minlength:3,
        maxlength:20,
        required:true,
    },
    link:{
        type:String,
        required:true,
    },
});

module.exports.eventJoiSchema = eventJoiSchema;
module.exports.eventMongooseSchema = eventMongooseSchema;