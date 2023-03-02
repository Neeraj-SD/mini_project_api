const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');

const {skillMongooseSchema, skillJoiSchema} = require('../models/skill');
const Skill = mongoose.model('Skill', skillMongooseSchema)

router.get('/', async (req, res, next)=>{
    const skills = await Skill.find().sort({name:1});
    return res.status(200).send(skills);
});

router.post('/', async (req, res, next)=>{
    const {error, value} = skillJoiSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    const skill = new Skill({
        name:value.name,
        shortName:value.shortName,
        image:value.image,
    });

    const result = await skill.save();
    return res.status(201).send(result);
})

module.exports = router;
