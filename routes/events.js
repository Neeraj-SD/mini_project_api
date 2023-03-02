const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');
const mongoose =  require('mongoose');
const {communityJoiSchema, communityMongooseSchema} = require('../models/community');
const {eventJoiSchema, eventMongooseSchema} = require('../models/event');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const imageUpload = require('../middlewares/image-upload');
const admin = require('../firebase/firebase-config');
const Community = mongoose.model("Community", communityMongooseSchema);
const Event = mongoose.model("Event", eventMongooseSchema);
const User = mongoose.model("User", userMongooseSchema);

//TODO: pagenation for events

router.get('/', [auth], async (req, res, next)=>{
    const userId = req.user.id;

    const user = await User.findById(userId);

    if(!user) return res.status(404).send('User not found');

    const events = await Event.find({community:{$in:user.communities},time:{$gt:Date.now()}})
                                .populate({
                                    path:'community',
                                    select:'owner managers name _id image',
                                    populate:[
                                        {
                                            path:'managers',
                                            select:'name userName image _id'
                                        },
                                        {
                                            path:'owner',
                                            select:'name userName image _id'
                                        }
                                    ]
                                })
                                .populate('eventType');

    res.status(200).send(events);
    
});

router.get('/all', [auth], async (req, res, next)=>{
    //return res.status(200).send([]);

    const events = await Event.find({time:{$gt:Date.now()}})
                                .populate({
                                    path:'community',
                                    select:'owner managers name _id image',
                                    populate:[
                                        {
                                            path:'managers',
                                            select:'name userName image _id'
                                        },
                                        {
                                            path:'owner',
                                            select:'name userName image _id'
                                        }
                                    ]
                                })
                                .populate('eventType');

    res.status(200).send(events);
    
});

router.get('/all/filter/:eventTypeId', [auth,validObjectId('eventTypeId')], async (req, res, next)=>{
    const events = await Event.find({eventType:req.params.eventTypeId})
                                .populate({
                                    path:'community',
                                    select:'owner managers name _id image',
                                    populate:[
                                        {
                                            path:'managers',
                                            select:'name userName image _id'
                                        },
                                        {
                                            path:'owner',
                                            select:'name userName image _id'
                                        }
                                    ]
                                })
                                .populate('eventType');

    res.status(200).send(events);
})

router.get('/community/:communityId', [auth, validObjectId('communityId')], async (req, res, next)=>{
    const communityId= req.params.communityId;

    const community = await Community.findById(communityId);
    if(!community) return res.status(404).send('community not found');

    const events = await Event.find({community:communityId})
                                .sort({time:-1})
                                .populate({
                                    path:'community',
                                    select:'owner managers name _id image',
                                    populate:[
                                        {
                                            path:'managers',
                                            select:'name userName image _id'
                                        },
                                        {
                                            path:'owner',
                                            select:'name userName image _id'
                                        }
                                    ]
                                })
                                .populate('eventType');
    res.status(200).send(events);
});

router.post('/', [auth,imageUpload('events')], async (req, res, next)=>{    //untested
    const userId = req.user.id;
    const community = await Community.findOne().or([{owner:userId}, {managers:userId}]);
    if(!community) return res.status(404).send('User does not own a community');
    const {error, value} = eventJoiSchema.validate(req.body);


    if(error){
        console.log(error);

        return res.status(400).send(error);
    }

    //TODO: Event type validate

    let [dateString, timeString] = value.time.split(' ');

    let [hour, minute, second] = timeString.split(':');

    let [year, month, date] = dateString.split('/');

    value.time = new Date(year=year, month=month, date=date, hour=hour, minute=minute, second=second);


    const event = new Event({
        title:value.title,
        image:req.imageDetails.downloadUrl,
        time:value.time,
        description:value.description,
        contact:value.contact,
        link:value.link,
        type:value.type,
        community:community._id,
        eventType:value.eventType
    });

    const result = await event.save();

    const message = {
        notification:{
            title:`${community.name} just posted a new event`,
            body:`Registration for ${value.title} has started`
        },
        android:{
            notification:{
                channel_id:'rennovex.cambuzz'
            }
        },
        topic:'newEventAdded'
    }

    admin.messaging().send(message).then(response=>console.log('Event notification sent '+response)).catch(error=>console.log('error in notification '+error));

    res.status(201).send({
        title: result.title,
        imageUploadUrl:req.imageDetails.uploadUrl,
        imageDownloadUrl:req.imageDetails.downloadUrl,
        time:result.time,
        description:result.description,
        contact:result.contact,
        link:result.link,
        type:result.type,
        community:result.community,
    });
});

router.delete('/:id', [auth, validObjectId('id')], async (req, res, next)=>{
    const id= req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(id)
                                .sort({time:-1})
                                .populate({
                                    path:'community',
                                    select:'owner managers name _id image',
                                    populate:[
                                        {
                                            path:'managers',
                                            select:'name userName image _id'
                                        },
                                        {
                                            path:'owner',
                                            select:'name userName image _id'
                                        }
                                    ]
                                })
                                .populate('eventType');
    if(!event) return res.status(404).send('Event not found');
    if(userId == event.community.owner._id || event.community.managers.find(x=>x._id == userId)){
        const deleted = await event.remove();
        res.status(200).send(deleted);
    }
    else{
        res.status(403).send('User do not have permission to delete this event');
    }

});


router.get('/:id', [auth, validObjectId('id')], async (req, res, next)=>{
    const id= req.params.id;
    
    const event = await Event.findById(id).populate('community', 'owner managers name _id image').populate('managers', 'name userName image _id').populate('owner', 'name userName image _id');

    if(!event) return res.status(404).send('Event not found');

    res.status(200).send(event);
});


module.exports = router;