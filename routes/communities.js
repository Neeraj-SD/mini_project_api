const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {communityJoiSchema, communityMongooseSchema} = require('../models/community');
const validObjectId = require('../middlewares/validObjectId');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const {getRandomCoverImage} = require('../aws/cover-image');
const {eventJoiSchema, eventMongooseSchema} = require('../models/event');



const mongoose =  require('mongoose');
const imageUpload = require('../middlewares/image-upload');

const Community = mongoose.model("Community", communityMongooseSchema);
const User = mongoose.model("User", userMongooseSchema);
const Event = mongoose.model("Event", eventMongooseSchema);

router.get('/search/:key', async (req, res, next)=>{
    const key = req.params.key;
    const regX = new RegExp('.*'+key+'.*','i'); //Make a bit more complex
    const communities = await Community.find()
                            .or({name:regX});
    if(!communities) return res.status(404).send('Communities not found');
    if(communities.length == 0)  return res.status(404).send('Communities not found');

    res.status(200).send(communities);

});

//TODO: FIX spell check

router.get('/name-available/:name', async (req, res)=>{
    const name = req.params.name;
    const community = await Community.findOne({name});
    if(community) return res.status(409).send();
    else return res.status(200).send();
})

router.post('/', [auth,imageUpload('communityImages')], async (req, res, next)=>{
    const body = req.body;
    const {error, value } = communityJoiSchema.validate(body);
    if(error) return res.status(400).send(error);

    try{
        const community = new Community({
            name:value.name,
            image:req.imageDetails.downloadUrl,
            coverImage:'https://picsum.photos/200',
            owner:req.user.id,
        });
        await community.save();
        res.status(201).send({
            name:community.name,
            owner:req.user.id,
            image:req.imageDetails.downloadUrl,
            coverImage:community.coverImage,
            members:community.members,
            managers:community.managers,
            imageUploadUrl:req.imageDetails.uploadUrl
        });
    }
    catch(ex){
        if(ex.code==11000){
            if(ex.keyPattern.name ===1 ) res.status(409).send('name not available')
        }
        else{
            res.status(400).send(ex);
        }
    }
});

router.get('/:id/members', [auth, validObjectId('id')], async (req, res)=>{
    const communities = await Community.findById(req.params.id).populate('members','name image userName _id');
    if(!community) return res.status(404).send('Community does not exist');
    return res.status(200).send(communities.members);

})

router.get('/all', auth, async (req, res)=>{
    const communities = await Community.find().populate('owner','name image userName _id');
    return res.status(200).send(communities)
});

router.post('/join/:id', [auth, validObjectId('id')], async (req, res)=>{
    const community = await Community.findById(req.params.id);
    if(!community) return res.status(404).send('Community does not exist');
    const user = await User.findById(req.user.id);
    if(user.communities.includes(community._id)) return res.status(400).send('User already joined');
    user.communities.push(community._id);
    await user.save();
    return res.status(200).send(user);
});

router.delete('/join/:id', [auth, validObjectId('id')], async (req, res)=>{
    const community = await Community.findById(req.params.id);
    if(!community) return res.status(404).send('Community does not exist');
    const user = await User.findById(req.user.id);
    if(!user.communities.includes(community._id)) return res.status(400).send('User did not join community');

    const indexOfCommunity = user.communities.findIndex(id=>community._id===id);
    user.communities.splice(indexOfCommunity,1);
    await user.save();
    return res.status(200).send(user);
});

router.get('/', auth, async (req, res, next)=>{ //test
    const id = req.user.id;

    const community = await Community.find().or([{owner:id},{managers:id}]).populate('managers','name image userName _id').populate('events').populate('owner','name image userName _id');
    console.log(community);
    if(!community[0]) return res.status(404).send('Community not found');

    const members = await User.find({communities:community[0]._id}).select('_id');
    const members_array = members.map(member=>member._id);

    const events = await Event.find({community:community[0]._id})

    res.status(200).send({
        _id:community[0]._id,
        name:community[0].name,
        owner:community[0].owner,
        image:community[0].image,
        isOwner:community[0].owner.equals(id),
        isManager:community[0].managers.find(x=>x._id.equals(req.user.id))?true:false,
        coverImage:getRandomCoverImage(),
        eventsCount:events.length,
        membersCount:members.length,
        isMember:members_array.findIndex(x=>x.equals(req.user.id))>=0?true:false,
        isSociety:community[0].isSociety,
    });
});

router.get('/managers', auth, async (req, res, next)=>{
    const id = req.user.id;

    const community = await Community.findOne({owner:id}).populate('managers','name image userName _id');

    if(!community) return res.status(404).send('Community not found');

    res.status(200).send(community.managers);
});

router.put('/', [auth, imageUpload('communityImages')], async (req, res, next)=>{
    const id = req.user.id;

    const community = await Community.findOne({owner:id}).populate('managers','name image userName _id');
    if(!community) return res.status(404).send('Community not found');

    const {error, value} = communityJoiSchema.validate(req.body);

    if(error) return res.status(400).send('Invalid community object')

    community.set({
        ...value,
        image:req.imageDetails.downloadUrl,
    });
    
    const result = await community.save();

    res.status(200).send({
        name:community.name,
        owner:req.user.id,
        image:req.imageDetails.downloadUrl,
        coverImage:community.coverImage,
        members:community.members,
        managers:community.managers,
        imageUploadUrl:req.imageDetails.uploadUrl
    });
    
});

router.put('/without-image', [auth], async (req, res, next)=>{
    const id = req.user.id;

    const community = await Community.findOne({owner:id}).populate('managers','name image userName _id');
    if(!community) return res.status(404).send('Community not found');

    const {error, value} = communityJoiSchema.validate(req.body);

    if(error) return res.status(400).send('Invalid community object')

    community.set(value);
    
    const result = await community.save();

    res.status(200).send({
        name:community.name,
        owner:req.user.id,
        image:community.image,
        coverImage:community.coverImage,
        members:community.members,
        managers:community.managers,
    });
    
});


router.post('/managers/:id', [auth, validObjectId('id')], async (req, res, next)=>{
    const userId = req.user.id;
    const managerId = req.params.id;

    if(userId === managerId) return res.status(400).send('Owner cannot be manager');

    const community = await Community.find([{owner:userId}, {managers:userId}]);
    if(!community[0]) return res.status(404).send('Community not found');

    const user = await User.findById(managerId);
    if(!user) return res.status(404).send('User not found');
    
    if(community[0].managers.includes(managerId)) return res.status(400).send('user is already a manager');

    community[0].managers.push(managerId);

    const result = await community[0].save();

    res.status(200).send(result);
});

router.delete('/managers/:id', [auth, validObjectId('id')], async (req, res, next)=>{
    const ownerId = req.user.id;
    const managerId = req.params.id;

    const community = await Community.findOne({owner:ownerId});
    if(!community) return res.status(404).send('Community not found');

    if(!community.managers.includes(managerId)) return res.status(404).send('Manager not found');

    community.managers.splice(community.managers.indexOf(managerId), 1);

    const result = await community.save();

    res.status(200).send(result);
});

router.get('/:id', [auth, validObjectId('id')], async (req, res, next)=>{
    const id = req.params.id;

    const community = await Community.findById(id).populate('managers','_id name image userName _id').populate('events');
    if(!community) return res.status(404).send('Community not found');

    const members = await User.find({communities:community._id}).select('_id');

    const owner = await User.findById(community.owner).select('communities name userName image');

    const members_array = members.map(member=>member._id);

    
    const events = await Event.find({community:community._id})

    //
    res.status(200).send({
        _id:community._id,
        name:community.name,
        owner:{
            _id:owner._id,
            name:owner.name,
            userName:owner.userName,
            image:owner.image
        },
        isManager:community.managers.find(x=>x._id.equals(req.user.id))?true:false,
        image:community.image,
        coverImage:getRandomCoverImage(),
        eventsCount:events.length,
        membersCount:members.length,
        isOwner:owner._id.equals(req.user.id),
        isMember:members_array.findIndex(x=>x.equals(req.user.id))>=0?true:false,
        isSociety:community.isSociety,
    });
    //this
});



module.exports = router;