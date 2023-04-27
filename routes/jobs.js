const express = require('express');
const { Job, validate, Bid } = require('../models/job');
const { JobType } = require('../models/job_type');
const validObjectId = require('../middlewares/validObjectId');
const auth = require('../middlewares/auth');
const router = express.Router()


router.get('/', async (req, res) => {
    const job = await Job.find({}, '-userId.fcmToken').populate('userId jobType')

    return res.status(200).send(job)

})

router.get('/me', auth, async (req, res) => {
    const job = await Job.find()

    return res.status(200).send(job)

})

router.post('/', auth, async (req, res) => {
    const userId = req.user.id
    const { error, value } = validate(req.body)
    if (error) return res.status(400).send(error['details'][0]['message'])

    const jobType = await JobType.findById(value.jobType)
    if (!jobType) return res.status(400).send('Invalid Job Type')

    const job = new Job({
        userId: userId,
        jobType: jobType,
        location: value.location,
        image: value.image,
        description: value.description,

    })

    await job.save()

    res.status(201).send(job)

})

router.post('/:id/bid', auth, async (req, res) => {
    const userId = req.user.id
    const jobId = req.params.id

    const job = await Job.findById(jobId)
    if (!job) return res.status(400).send('Invalid Job')

    if (!req.body.bid) return res.status(400).send('Bid amount required.')
    if (req.body.bid < 0) return res.status(400).send('Bid amount should be positive value.')

    const bid = Bid({ workerId: userId, amount: req.body.bid })
    job.bids.push(bid);
    await job.save()

    res.status(201).send(job)

})

router.post('/:id/accept', auth, async (req, res) => {
    const userId = req.user.id
    const jobId = req.params.id
    // const bidId = req.body.bidId;

    const job = await Job.findById(jobId).populate('bids')
    if (!job) return res.status(400).send('Invalid Job')

    if (!req.body.bidId) return res.status(400).send('bidId is required.')
    const bid = await Bid.findById(req.body.bidId);
    console.log(bid)
    if (!bid) return res.status(400).send('Invalid bidId.')

    // const bid = Bid({ workerId: userId, amount: req.body.bid })
    // job.bids.push(bid);
    bidIndex = job.bids.findIndex(bid);
    if (bidIndex == -1)
        return res.status(404).send('Given bidId not valid for the given job')

    job.acceptedBid = bid
    job.status = 'accepted'

    await job.save()

    res.status(201).send(job)

})

router.delete('/:id', validObjectId('id'), async (req, res) => {
    const id = req.params.id
    const job = await Job.findById(id)
    if (!job) return res.status(404).send('Job does not exist.')

    await job.delete()

    res.status(200).send('Job deleted.')

})

module.exports = router;