const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const ipAddressSchema = mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    ip:{type:String, required:true, minlength:3, maxlength:20},
    timeStamp:{type:Date, default:Date.now},
});

const IPAddress = mongoose.model('IPAddress', ipAddressSchema);

const ipAddressJoiSchema = Joi.object({
    ip:Joi.string().required().min(3).max(20)
});

const validate = function(body) {
    return ipAddressJoiSchema.validate(body);
}

exports.IPAddress = IPAddress;
exports.validate = validate;