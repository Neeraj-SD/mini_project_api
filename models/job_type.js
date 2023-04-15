const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const jobTypeSchema = mongoose.Schema({
    name: { type: String, required: true, min: 3, max: 100, unique: true }
});

const JobType = mongoose.model('JobType', jobTypeSchema);

const jobTypeJoiSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
});

const validate = function (body) {
    return jobTypeJoiSchema.validate(body);
}

exports.JobType = JobType;
exports.validate = validate;