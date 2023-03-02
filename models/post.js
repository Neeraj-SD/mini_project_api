const mongoose =  require('mongoose');
const Joi = require('joi');
const { ObjectID } = require('mongodb');
Joi.objectId = require('joi-objectid')(Joi);

const postJoiSchema = Joi.object({
    title:Joi.string().required().min(3).max(1000),
    postImage:Joi.string(),
    postText:Joi.string(),
    fileType:Joi.string(),
});

const postMongooseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:1,
        maxlength:1000,
    },
    postType:{
        type:String,
        enum: ['communityPost','userPost'],
        required:true,
    },
    community:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Community',
        validate:{
            validator: function(v){
                console.log(String(v));
                if(this.postType === 'communityPost' && String(v).trim().length == 0) return false;
                return true;
            },
            message:'community post should contain community id'
        }
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    time:{
        type:Date,
        required:true,
        default:Date.now
    },
    postImage:{
        type:String,
    },
    postText:{  
        type:String,
    },
    comments:[
        {
            type: new mongoose.Schema({
                user:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User"
                },
                text:{
                    type:String,
                    required:true
                }
            })
        }
    ],
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "User"
        }
    ]
});

module.exports.postJoiSchema = postJoiSchema;
module.exports.postMongooseSchema = postMongooseSchema;