const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const achievementJoiSchema = Joi.object({
    image:Joi.string().required(),
    title:Joi.string().required().min(3).max(50),
    issueDate:Joi.date().required(),
});

const achievementMongooseSchema = new mongoose.Schema({
    image:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
        minlength:3,
        maxlength:50
    },
    community:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Community',
    },
    issueDate:{
        type:Date,
        default:Date.now,
        required:true,
    },
});

module.exports.achievementJoiSchema = achievementJoiSchema;
module.exports.achievementMongooseSchema = achievementMongooseSchema;
