const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const reportMongooseSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    time:{
        type:Date,
        required:true,
        default:Date.now
    },
    objectType:{
        type:String,
        require:true
    },
    objectId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
    },
    reason:{
        type:String,
        minlength:1,
        maxlength:50
    }   
});

const reportJoiSchema = Joi.object({
    objectType:Joi.string().required(),
    objectId:Joi.objectId().required(),
    reason:Joi.string().min(1).max(50)
});

module.exports.reportJoiSchema = reportJoiSchema;
module.exports.reportMongooseSchema = reportMongooseSchema;