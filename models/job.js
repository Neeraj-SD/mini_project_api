const mongoose = require('mongoose')
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const bidSchema = mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    amount: { type: Number, required: true },
})

const Bid = mongoose.model('Bid', bidSchema);

const jobSchema = mongoose.Schema({
    // _from: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    jobType: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'JobType' },
    location: { type: String, required: true, minlength: 1, maxlength: 255 },
    image: { type: String, required: true, minlength: 1, maxlength: 255 },
    description: { type: String, required: true, minlength: 1, maxlength: 255 },
    timeStamp: { type: Date, default: Date.now },
    customerRating: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 },
    status: { type: Number, enum: ['waiting', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'waiting' },
    bids: { type: Array, ref: 'Bid' },
    acceptedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
    workerId: { type: mongoose.Schema.Types.objectId, ref: 'User' }
    // status: { type: String, enum: ['delivered', 'read', 'sent'], default: 'sent' }
});

const Job = mongoose.model('Job', jobSchema);

const jobJoiSchema = Joi.object({
    userId: Joi.objectId(),
    location: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(3).max(255),
    image: Joi.string().required().min(5).max(255),
    jobType: Joi.objectId(),
});

const validate = function (body) {
    return jobJoiSchema.validate(body);
}

exports.Job = Job;
exports.validate = validate;