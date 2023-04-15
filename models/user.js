const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const jwt = require('jsonwebtoken')
const config = require('config')
const _ = require('lodash')

const userSchema = mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 255 },
    image: { type: String, minlength: 3, maxlength: 255 },
    email: { type: String, required: true, minlength: 3, maxlength: 255, unique: true },
    isCustomer: { type: Boolean, default: true },
    timeStamp: { type: Date, default: Date.now },
    fcmToken: { type: String, default: '', maxlength: 500 },
    googleUid: { type: String, minlength: 3, maxlength: 100, required: true }
})

const User = mongoose.model('User', userSchema)

const userJoiSchema = Joi.object({
    name: Joi.string().required().min(3).max(255),
    image: Joi.string().min(3).max(500),
    email: Joi.string().required().min(3).max(500),
    isCustomer: Joi.boolean(),
    fcmToken: Joi.string().min(3).max(500),
    googleUid: Joi.string().required().min(3).max(500),

})

const validate = function (body) {
    return userJoiSchema.validate(body)
}

User.prototype.generateAuthToken = function () {
    const token = jwt.sign({ id: this.id, isCustomer: this.isCustomer }, config.get('jwtPrivateKey'))
    return token
}

//TODO: This doesnt work
User.prototype.getSafeUser = async function () {
    await this.populate('interests avatar campus');
    return _.get(this, 'name nickName gender domain campus interests avatar email age'.split())
}

User.prototype.getUserWithoutToken = async function () {
    // await this.populate('interests avatar')
    return {
        _id: this.id,
        name: this.name,
        email: this.email,
        picture: this.picture,
    }
}

User.prototype.getAnonymousUser = async function () {
    // await this.populate('interests avatar')
    return {
        _id: this.id,
        name: this.name,
        email: this.email,
        picture: this.picture,
        'x-auth-token': this.generateAuthToken()
    }
}

exports.User = User
exports.validate = validate