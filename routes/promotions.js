const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const {communityJoiSchema, communityMongooseSchema} = require('../models/community');
const validObjectId = require('../middlewares/validObjectId');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const {promotionJoiSchema, promotionMongooseSchema}=require('../models/promotion');
const {eventJoiSchema, eventMongooseSchema}=require('../models/event');


const mongoose =  require('mongoose');

const Community = mongoose.model("Community", communityMongooseSchema);
const User = mongoose.model("User", userMongooseSchema);
const Promotion = mongoose.model("Promotion", promotionMongooseSchema);
const Event = mongoose.model("Event", eventMongooseSchema);


router.get('/:id', [auth,validObjectId("id")], async (req, res, next)=> {
    const id= req.params.id;
    const promotion = await Promotion.findById(id).populate('community');

    if(!promotion) return res.status(404).send('Promotion not found');

    res.status(200).send(promotion);

});

router.get('/community/:communityId', [auth,validObjectId("communityId")], async (req, res, next)=> {
    const communityId = req.params.communityId;

    const community = await Community.findById(communityId);
    if(!community) return res.status(404).send('Community not found');

    const promotions = await Promotion.find({community:communityId});

    res.status(200).send(promotions);

});

//WOrk on this
router.get('/today', auth, async (req, res, next)=> {
    const promotions = await Promotion.find({time})
});

router.post('/', auth, async (req, res, next)=> {
    const userId = req.user.id;

    const community = await Community.findOne().or([{owner:userId},{managers:userId}]); //test
    if(!community) return res.status(403).send('User has no access to post');

    const {error, value} = promotionJoiSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found');

    const event = value.eventId?Event.findById(value.eventId):undefined;
    const promotion = new Promotion({
        title:value.title,
        image:value.image,
        event:event?._id,
        community:community._id
    });

    const result = await promotion.save();

    res.status(201).send(result);
});

router.delete('/:id', [auth,validObjectId("id")], async (req, res, next)=> {
    const id= req.params.id;
    const promotion = await Promotion.findById(id).populate('community');

    if(!promotion) return res.status(404).send('Promotion not found');

    const result = promotion.remove();

    res.status(200).send(result);

});

module.exports = router;