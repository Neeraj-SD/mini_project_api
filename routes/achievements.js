const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');

const {communityJoiSchema, communityMongooseSchema} = require('../models/community');
const {achievementMongooseSchema, achievementJoiSchema} = require('../models/achievement');
const validObjectId = require('../middlewares/validObjectId');
const {userMongooseSchema, userJoiSchema}=require('../models/user');

const Community = mongoose.model("Community", communityMongooseSchema);
const User = mongoose.model("User", userMongooseSchema);
const Achievement = mongoose.model('Achievement', achievementMongooseSchema);

router.get('/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;

    const achievement = await Achievement.findById(req.params.id);

    if(!achievement) return res.status(404).send('Acheivement not found on server');

    res.status(200).send(achievement);

});

router.get('/user/:userId', [auth, validObjectId('userId')], async (req, res, next)=> {
    const userId= req.params.userId;

    const user = await User.findById(userId).populate('achievements');
    if(!user) return res.status(404).send('User not found');

    res.status(200).send(user.achievements);
    

});

router.get('/community/:communityId', [auth, validObjectId('communityId')], async (req, res, next)=> {
    const communityId= req.params.communityId;

    const achievements = await Achievement.find({community:communityId});

    res.status(200).send(achievements);
});

router.post('/user/:userId', [auth, validObjectId('userId')], async (req, res, next)=> {
    const userId = req.user.id;
    const reciever = req.params.userId;

    const community = await Community.findOne().or([{owner:userId},{managers:userId}]); //test
    if(!community) return res.status(403).send('User has no access to post');

    const {error, value} = achievementJoiSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    const user = await User.findById(reciever);
    if(!user) return res.status(404).send('User not found');
    

    const achievement = new Achievement({
        ...value,
        community:community._id
    });

    const result = await achievement.save();

    user.achievements.push(result._id); 

    await user.save();

    res.status(201).send(result);
});

router.delete('/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;

    const userId= req.user.id;

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found');

    const community = await Community.findOne().or([{owner:userId},{managers:userId}]); //test
    if(!community) return res.status(403).send('User has no access');

    const achievement = await Achievement.findById(id).populate('community');

    if(!achievement) return res.status(402).send('achievement not found');

    if(!achievement.community._id.equals(community._id)) return res.status(403).send('User has no access to delete this achievement');

    const result = await achievement.remove();
    res.status(200).send(result);

});


module.exports = router;