const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const eventTypeJoiSchema = Joi.object({
    name:Joi.string().min(3).max(20).required(),
    image:Joi.string().required()
})

const eventTypeMongooseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:50,
        minlength:3,
        unique:true,
    },
    image:{
        type:String,
        required:true
    }
});

module.exports.eventTypeMongooseSchema = eventTypeMongooseSchema;
module.exports.eventTypeJoiSchema = eventTypeJoiSchema;