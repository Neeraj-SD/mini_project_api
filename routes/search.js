const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');
const imageUpload = require('../middlewares/image-upload');

const {communityJoiSchema, communityMongooseSchema} = require('../models/community');
const Community = mongoose.model("Community", communityMongooseSchema);

const {skillMongooseSchema} = require('../models/skill');
const Skill = mongoose.model('Skill', skillMongooseSchema)

const User = mongoose.model("User", userMongooseSchema);
const {userLoginJoiSchema, userLoginMongooseSchema} = require('../models/user-login');

router.get('/filter/id/:skillId/:key', [auth, validObjectId('skillId')], async (req, res, next)=>{
    const skillId = req.params.skillId;
    const key = req.params.key;

    const regX = new RegExp('\\b'+key+'*','i');

    const skill = await Skill.findById(skillId);

    if(!skill) return res.status(404).send('skill not found');

    const users = await User.find({skills:skillId,_id:{$nin:req.user.user.blocked}})
                            .or({userName:{$regex:regX}, name:{$regex:regX}})
                            .select('name userName image _id');
                            

    res.status(200).send(users);
});

router.get('/filter/id/:skillId', [auth, validObjectId('skillId')], async (req, res, next)=>{
    const skillId = req.params.skillId;
    const skill = await Skill.findById(skillId);

    if(!skill) return res.status(404).send('skill not found');

    const users = await User.find({skills:skillId,_id:{$nin:req.user.user.blocked}})
                            .select('name userName image _id');
                            

    res.status(200).send(users);
});

router.get('/filter/:skill/:key', [auth], async (req, res, next)=>{
    const skillName = req.params.skill;
    const key = req.params.key;

    const regX = new RegExp('\\b'+key+'.*','i');

    const skill = await Skill.findOne({name:skillName});

    if(!skill) return res.status(404).send('skill not found');
    
    const users = await User.find({skills:skill._id,_id:{$nin:req.user.user.blocked}})
                            .or({userName:regX, name:regX})
                            .select('name userName image _id')
                            

    res.status(200).send(users);
});

router.get('/:key', auth, async (req, res)=>{
    const key = req.params.key;
    console.log(key);
    const regXBeg = new RegExp('\\b'+key+'.*','i');
    const regXMid = new RegExp('.*'+key+'.*','i');
    console.log(regXBeg);

    let communites;
    let users=[];


    if(!key.startsWith('$')){
        users = await User.find({userName:{$regex:regXBeg}, name:{$regex:regXBeg}, _id:{$nin:req.user.user.blocked}}).select('name userName image _id')
    }

    communites = await Community.find({name:regXBeg}).select('name image _id')
    
    res.status(200).send([...users, ...communites]);
});


module.exports = router;



