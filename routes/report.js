const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');
const {reportJoiSchema, reportMongooseSchema} = require('../models/report');


const Report = mongoose.model("Report", reportMongooseSchema);


router.post('/', [auth], async (req, res)=>{
    const {error, value} = reportJoiSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    const report = new Report({
        user:req.user.id,
        objectType:value.objectType,
        objectId:value.objectId,
        reason:value.reason??'-'
    });

    const result = await report.save();

    return res.status(201).send(result);
});

module.exports = router;