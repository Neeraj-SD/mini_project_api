const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const messageSchema = mongoose.Schema({
    _from: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    _to: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    body: { type: String, required: true, minlength: 1, maxlength: 1000 },
    timeStamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['delivered', 'read', 'sent'], default: 'sent' }
});

const Message = mongoose.model('Message', messageSchema);

const messageJoiSchema = Joi.object({
    body: Joi.string().required().min(1).max(1000),
});

const validate = function (body) {
    return messageJoiSchema.validate(body);
}

exports.Message = Message;
exports.validate = validate;