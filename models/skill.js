const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const skillMongooseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:50,
        minlength:3,
        unique:true,
    },
    shortName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:50,
        unique:true
    },
    image:{
        type:String,
        required:true
    }
});

const skillJoiSchema = Joi.object({
    name:Joi.string().min(3).max(50).required(),
    shortName:Joi.string().min(3).max(50),
    image:Joi.string().required()
})

module.exports.skillMongooseSchema = skillMongooseSchema;
module.exports.skillJoiSchema = skillJoiSchema;