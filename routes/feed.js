const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {postJoiSchema, postMongooseSchema} = require('../models/post');
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
const Post = mongoose.model("Post", postMongooseSchema);


//TODO:Blocked scene

router.get('/', auth, async (req, res, next)=> {
    const user = await User.findById(req.user.id);
    const followingIds =  user.following;
    const communityIds = user.communities;

    const posts = await Post.find({user:{$nin:user.blocked}})
                        .or([
                            {community:{$in:communityIds}},
                            {user:{$in:followingIds}},
                            {user:user._id}
                        ])
                        .sort({time:-1})
                        .populate('user', 'name userName image')
                        .populate('community', 'name owner image coverImage')
                        .exec(function(error, posts) {
                            if(error) {
                                return res.status(500).send({msg: 'Error occurred while getting posts.', error: error});
                            }
                            //Try changing the referencePeople here
                            return res.status(200).send(posts.map(post=>{
                                return {
                                    _id:post._id,
                                    title:post.title,
                                    postType:post.postType,
                                    community:post.community,
                                    user:post.user,
                                    time:post.time,
                                    postImage:post.postImage,
                                    postText:post.postText,
                                    likeCount:post.likes.length,
                                    commentCount:post.comments.length,
                                    isLiked:post.likes.includes(req.user.id)}
                            }));
                        });

});

//TODO: feed communities not working
router.get('/:feedChunk', [auth], async (req, res, next)=>{
    const feedChunkSize = 4;
    const feedChunk = req.params.feedChunk;

    const user = await User.findById(req.user.id);
    const followingIds =  user.following;
    const communityIds = user.communities;

    const posts = await Post.find({user:{$nin:user.blocked}})
                        .or([
                            {community:{$in:communityIds}},
                            {user:{$in:followingIds}},
                            {user:user._id}
                        ])
                        .sort({time:-1})
                        .populate('user', 'name userName image')
                        .populate('community', 'name owner image coverImage')
                        .skip((feedChunk-1)*feedChunkSize)
                        .limit(feedChunkSize)
                        .exec(function(error, posts) {
                            if(error) {
                                return res.status(500).send({msg: 'Error occurred while getting posts.', error: error});
                            }
                            //Try changing the referencePeople here
                            return res.status(200).send(posts.map(post=>{
                                return {
                                    _id:post._id,
                                    title:post.title,
                                    postType:post.postType,
                                    community:post.community,
                                    user:post.user,
                                    time:post.time,
                                    postImage:post.postImage,
                                    postText:post.postText,
                                    commentCount:post.comments.length,
                                    likeCount:post.likes.length,
                                    isLiked:post.likes.includes(req.user.id)}
                            }));
                        });
                        
});

//TODO:get if new feed element is generated


module.exports = router;