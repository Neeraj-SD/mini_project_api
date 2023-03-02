const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const promotionJoiSchema = Joi.object({
    title:Joi.string().min(3).max(50).required(),
    eventId:Joi.objectId(),
    image:Joi.string().required()
});

const promotionMongooseSchema = new mongoose.Schema({
    community:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Community'
    },
    title:{
        type:String,
        minlength:3,
        maxlength:50,
        required:true,
    },
    time:{
        type:Date,
        default:Date.now,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    event:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Event'
    }
})


module.exports.promotionJoiSchema = promotionJoiSchema;
module.exports.promotionMongooseSchema = promotionMongooseSchema;