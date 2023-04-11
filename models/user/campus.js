const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const campusSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength:255,
    }
});

const Campus = mongoose.model('Campus', campusSchema);

const campusJoiSchema = Joi.object({
    name:Joi.string().required().max(255).min(3),
});

const validate = function(body) {
    return campusJoiSchema.validate(body);
}

exports.Campus = Campus;
exports.validate = validate;