const express = require('express');
const router = express.Router();
const joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const User = mongoose.model("User", userMongooseSchema);
const imageUpload = require('../middlewares/image-upload');
const _ = require('lodash');

router.post('/register',imageUpload('profileImages'), async (req, res, next)=>{
    console.log(req.body);
    const {error, value} = userJoiSchema.validate(req.body);
    if(!req.body.uid) return res.status(400).send('Uid not found');
    if(error) return res.status(400).send(error);

    if(!value.email.endsWith('@tkmce.ac.in')) return res.status(400).send('non tkmce user');

    let user = await User.find().or([{email:value.email}, {userName:value.userName}]);
    if(user[0]) return res.status(400).send('User with same email or username already exists');

    user = new User({
        email:value.email,
        uid:value.uid,
        userName:value.userName,
        name:value.name,
        skills:value.skills,
        bio:value.bio,
        image:req.imageDetails.downloadUrl,
        coverImage:'https://picsum.photos/200/300'
    });

    const salt = await bcrypt.genSalt(10);
    user.uid = await bcrypt.hash(user.uid, salt);

    await user.save();

    res.header('x-auth-token', user.generateJwtKey()).status(201).send({..._.pick(user,'_id', 'name', 'email', 'userName', 'image', 'bio', 'skills'), imageUploadUrl:req.imageDetails.uploadUrl,})
});

router.get('/is-user-registered/:email', async (req, res)=>{
    const email = req.params.email;
    console.log('is user registered request with email'+email);

    let user = await User.findOne({email:email});
    if(!user) return res.status(404).send('User is not registered');
    return res.status(200).send('User is registered')
})

router.post('/login', async (req, res)=>{
    console.log(req.body);
    
    if(!req.body.email || !req.body.uid) return res.status(400).send(error);

    let user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send('User is not registered');

    const validUID = await bcrypt.compare(req.body.uid,user.uid);

    user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send('User profile not completed yet');

    if(!validUID) return res.status(400).send('invalid credentials');
    //TODO: Cannot send id
    res.header('x-auth-token', user.generateJwtKey()).status(200).send(_.pick(user,'_id', 'name', 'email', 'userName', 'image',))
});


module.exports = router;