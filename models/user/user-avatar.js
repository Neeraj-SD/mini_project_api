const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const userAvatarSchema = mongoose.Schema({
    name:{type:String, required:true, minlength:3, maxlength:255},
    url:{type:String, required:true, minlength:3, maxlength:1000}
});

const UserAvatar = mongoose.model('UserAvatar', userAvatarSchema);

const userAvatarJoiSchema = Joi.object({
    name:Joi.string().required().max(255).min(3),
    url:Joi.string().required().max(1000).min(3),
});

const validate = function(body) {
    return userAvatarJoiSchema.validate(body);
}

exports.UserAvatar = UserAvatar;
exports.validate = validate;