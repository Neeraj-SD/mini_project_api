const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');
const mongoose =  require('mongoose');
const imageUpload = require('../middlewares/image-upload');
const {eventTypeJoiSchema, eventTypeMongooseSchema} = require('../models/event-type');

const EventType = mongoose.model("EventType", eventTypeMongooseSchema);

router.post('/', auth, async (req, res, next)=>{
    const {error, value} = eventTypeJoiSchema.validate(req.body);

    if(error) return res.status(400).send(error);

    const eventType = new EventType({
        name:value.name,
        image:value.image,
    });

    const result = await eventType.save();
    res.status(201).send(result);
});

router.get('/', auth, async (req, res, next)=>{
    const eventTypes = await EventType.find().sort({name:1});
    res.status(200).send(eventTypes);
})

module.exports = router;