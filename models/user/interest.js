const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const interestSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength:255,
    }
});

const Interest = mongoose.model('Interest', interestSchema);

const interestJoiSchema = Joi.object({
    name:Joi.string().required().max(255).min(3),
});

const validate = function(body) {
    return interestJoiSchema.validate(body);
}

exports.Interest = Interest;
exports.validate = validate;