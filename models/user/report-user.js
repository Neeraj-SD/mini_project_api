const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const reportUserSchema = mongoose.Schema({
    from:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    to:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    body:{type:String, maxlength:1000},
    timeStamp:{type:Date, default:Date.now},
    chatHistory:{type:String, minlength:3, maxlength:1000}
});

const ReportUser = mongoose.model('ReportUser', reportUserSchema);

const reportUserJoiSchema = Joi.object({
    to:Joi.objectId().required(),
    body:Joi.string().max(1000),
});

const validate = function(body) {
    return reportUserJoiSchema.validate(body);
}

exports.ReportUser = ReportUser;
exports.validate = validate;