const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const workerSchema = mongoose.Schema({
    // _from: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    profession: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Profession' },
    address: { type: String, required: true, minlength: 1, maxlength: 255 },
    phoneNumber: { type: String, required: true, minlength: 3, maxlength: 15 },
    timeStamp: { type: Date, default: Date.now },
    experience: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 }
    // status: { type: String, enum: ['delivered', 'read', 'sent'], default: 'sent' }
});

const Worker = mongoose.model('Worker', workerSchema);

const workerJoiSchema = Joi.object({
    userId: Joi.objectId(),
    address: Joi.string().required().min(3).max(255),
    phoneNumber: Joi.string().required().min(5).max(15),
    experience: Joi.number(),
    profession: Joi.objectId(),
});

const validate = function (body) {
    return workerJoiSchema.validate(body);
}

exports.Worker = Worker;
exports.validate = validate;