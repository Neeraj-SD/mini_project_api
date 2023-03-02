const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');
const _ = require('lodash');

const {postJoiSchema, postMongooseSchema} = require('../models/post');
const Post = mongoose.model("Post", postMongooseSchema);

function getDays(){
    const numberofDays = 1;
    const today = new Date();
    const lastDay = new Date(today.getTime()-1000*60*60*24*numberofDays);
    const nextDay = new Date(today.getTime()+(1000*60*60*24*(numberofDays)));
    lastDay.setHours(0,1);
    nextDay.setHours(0,1);
    return {lastDay, nextDay}
}

//TODO: fix to realtimes
router.get('/user-posts/all', auth, async (req, res, next)=> {
    const {lastDay, nextDay} = getDays();
    //return res.send([]);
    const posts = await Post.aggregate([
        {
            '$match':{
                postType:'userPost',
                postText:null,
                time:{$gt:lastDay, $lt:nextDay}
            }
        },
        {
            '$project':{
                'title':1,
                'postType':1,
                'user':1,
                'time':1,
                'postImage':1,
                'comments':1,
                'likes':1,
                'likeCount':{'$size':'$likes'},
                'commentCount':{'$size':'$comments'}
            },
        },
        {'$sort': {'likeCount':-1}},
        {'$limit':3},
        {
            '$lookup':{
                from:'users', 
                localField:'user', 
                foreignField:'_id', 
                as:'user'
            }
        },
        {'$unwind':'$user'}
    ])
    .exec(function(error,posts){
        if(error) {
            return res.status(500).send({msg: 'Error occurred while getting posts.', error: error});
        }

        return res.status(200).send(posts.map(post=>{
            return {..._.pick(post,'_id', 'title', 'postImage', 'user', 'postType', 'time', 'likeCount', 'commentCount'), isLiked:(post.likes.map(user=>user.toString()).includes(req.user.id))}
        }));
    });


});

router.get('/community-posts/all', auth, async (req, res, next)=> {
    const {lastDay, nextDay} = getDays();

    //return res.send([]);
    const posts = await Post.aggregate([
        {
            '$match':{
                postType:'communityPost',
                postText:null,
                time:{$gt:lastDay, $lt:nextDay}
            }
        },
        {
            '$project':{
                'title':1,
                'postType':1,
                'user':1,
                'community':1,
                'time':1,
                'postImage':1,
                'comments':1,
                'likes':1,
                'likeCount':{'$size':'$likes'},
                'commentCount':{'$size':'$comments'},
                
            },
        },
        {'$sort': {'likeCount':-1}},
        {'$limit':10},
        {
            '$lookup':{
                from:'users', 
                localField:'user', 
                foreignField:'_id', 
                as:'user'
            }
        },
        {
            '$lookup':{
                from:'communities', 
                localField:'community', 
                foreignField:'_id', 
                as:'community'
            }
        },
        {'$unwind':'$user'},
        {'$unwind':'$community'},
    ])
    .exec(function(error,posts){
        if(error) {
            return res.status(500).send({msg: 'Error occurred while getting posts.', error: error});
        }
        return res.status(200).send(posts.map(post=>{

            return {...(_.pick(post,'_id','isLiked', 'title', 'postImage', 'user', 'postType', 'time', 'likeCount', 'community', 'commentCount')), isLiked:(post.likes.map(user=>user.toString()).includes(req.user.id))}
        }));
    });

});



module.exports = router;