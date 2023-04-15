const express = require('express');
const { Job, validate } = require('../models/job');
const { JobType } = require('../models/job_type');
const { isValidObjectId } = require('mongoose');
const validObjectId = require('../middlewares/validObjectId');
const router = express.Router()


router.get('/', async (req, res) => {
    const job = await Job.find()

    return res.status(200).send(job)

})

router.get('/me', auth, async (req, res) => {
    const job = await Job.find()

    return res.status(200).send(job)

})

router.post('/', auth, async (req, res) => {
    const userId = req.user

    const { error, value } = validate(req.body)
    if (error) return res.status(400).send(error['details'][0]['message'])

    const jobType = await JobType.findById(value.jobType)
    if(!jobType) return res.status(400).send('Invalid Job Type')
    
    const job = new Job({
        name: value.name,
    })

    await job.save()

    res.status(201).send(job)

})

router.delete('/:id', validObjectId('id'), async (req, res) => {
    const id = req.params.id
    const jobType = await Job.findById(id)
    if (!jobType) return res.status(404).send('Job type does not exist.')

    await jobType.delete()

    res.status(200).send('Job Type deleted.')

})

module.exports = router;