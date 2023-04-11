const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const jwt = require('jsonwebtoken')
const config = require('config')
const _ = require('lodash')

const userSchema = mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 255 },
    picture: { type: String, minlength: 3, maxlength: 255 },
    // nickName:{ type:String, required:true, minlength:3, maxlength:255 },
    // age:{ type:Number, required:true },
    // interests:[{type:mongoose.Schema.Types.ObjectId, ref: 'Interest'}],
    // avatar:{ type:mongoose.Schema.Types.ObjectId, ref:'UserAvatar'},
    // gender:{ 
    //     type:String, 
    //     required:true,
    //     enum:['male','female','lgbtq'],
    // },
    socket_id: { type: String, minlength: 3, maxlength: 255, default: 'default' },
    email: { type: String, required: true, minlength: 3, maxlength: 255, unique: true },
    // domain:{ 
    //     type:String,
    //     required:true,
    //     enum:['public', 'campus']
    // },
    // //TODO:Add validator, if domain == campus, required
    // campus:{ type:mongoose.Schema.Types.ObjectId, ref:'Campus'},
    timeStamp: { type: Date, default: Date.now },
    fcmToken: { type: String, default: '', maxlength: 500 },
    // isAdmin: { type: Boolean, default: false },
    // isBusiness: { type: Boolean, default: false },
    google_uid: { type: String, minlength: 3, maxlength: 100, required: true }
})

const User = mongoose.model('User', userSchema)

const userJoiSchema = Joi.object({
    name: Joi.string().required().min(3).max(255),
    // nickName: Joi.string().required().min(3).max(255),
    // age: Joi.number().required(),
    // interests: Joi.array().items(Joi.objectId()),
    // avatar: Joi.objectId(),
    // gender: Joi.string().valid('male', 'female', 'lgbtq').required(),
    // domain: Joi.string().valid('public', 'campus').required(),
    // campus: Joi.objectId().required(),
})

const validate = function (body) {
    return userJoiSchema.validate(body)
}

User.prototype.generateAuthToken = function () {
    const token = jwt.sign({ id: this.id, isAdmin: this.isAdmin, domain: this.domain, campus: this.campus }, config.get('jwtPrivateKey'))
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