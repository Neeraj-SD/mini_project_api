const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const customerSchema = mongoose.Schema({
    // _from: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    address: { type: String, required: true, minlength: 1, maxlength: 255 },
    phoneNumber: { type: String, required: true, minlength: 3, maxlength: 15 },
    timeStamp: { type: Date, default: Date.now },
    // status: { type: String, enum: ['delivered', 'read', 'sent'], default: 'sent' }
});

const Customer = mongoose.model('Customer', customerSchema);

const customerJoiSchema = Joi.object({
    userId: Joi.objectId(),
    address: Joi.string().required().min(3).max(255),
    phoneNumber: Joi.string().required().min(5).max(15),
});

const validate = function (body) {
    return customerJoiSchema.validate(body);
}

exports.Customer = Customer;
exports.validate = validate;