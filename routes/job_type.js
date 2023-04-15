const express = require('express');
const { JobType, validate } = require('../models/job_type');
const { isValidObjectId } = require('mongoose');
const validObjectId = require('../middlewares/validObjectId');
const router = express.Router()


router.get('/', async (req, res) => {
    const jobTypes = await JobType.find()

    return res.status(200).send(jobTypes)

})

router.post('/', async (req, res) => {
    const { error, value } = validate(req.body)
    if (error) return res.status(400).send(error['details'][0]['message'])

    let jobType = await JobType.findOne({ name: value.name })
    console.log(jobType)
    if (jobType) return res.status(400).send('Job type already exits.')

    jobType = new JobType({
        name: value.name,
    })

    await jobType.save()

    res.status(201).send(jobType)

})

router.delete('/:id', validObjectId('id'), async (req, res) => {
    const id = req.params.id
    const jobType = await JobType.findById(id)
    if (!jobType) return res.status(404).send('Job type does not exist.')

    await jobType.delete()

    res.status(200).send('Job Type deleted.')

})

module.exports = router;