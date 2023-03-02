const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {postJoiSchema, postMongooseSchema} = require('../models/post');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const imageUpload = require('../middlewares/image-upload');
const {communityJoiSchema, communityMongooseSchema} = require('../models/community');
const mongoose = require('mongoose');
const validObjectId = require('../middlewares/validObjectId');


const User = mongoose.model("User", userMongooseSchema);
const Community = mongoose.model("Community", communityMongooseSchema);
const Post = mongoose.model("Post", postMongooseSchema);


router.get('/:id', [auth, validObjectId('id')], async (req, res, next)=> { 
    const postId= req.params.id;

    const post = await Post.findById(postId)
                            .populate('user', 'name userName _id image')
                            .populate('community', 'name managers owner');
    
    if(!post) return res.status(404).send('post not found');

    res.status(200).send({
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
        isLiked:post.likes.includes(req.user.id)
    });
});

router.get('/user/:userId', [auth, validObjectId('userId')], async (req, res, next)=> {  
    const userId= req.params.userId;

    if(req.user.user.blocked.includes(userId)) return res.status(404).send('User not found') //But is actually blocked

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found')

    let posts = await Post.find({user:userId}).sort({time:-1}).populate('user', 'name userName _id image').populate('community', 'image name managers owner');
    if(!posts) return res.status(404).send('Posts not found');
    
    posts = posts.map(post=>{
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
    });

    res.status(200).send(posts);
});

router.get('/community/:communityId', [auth, validObjectId('communityId')], async (req, res, next)=> {
    const communityId = req.params.communityId;

    const community = await Community.findById(communityId);
    if(!community) return res.status(404).send('Community not found');

    let posts = await Post.find({community: communityId}).sort({time:-1}).populate('user', 'name userName _id image').populate('community', 'image name managers owner');
    if(!posts) return res.status(404).send('Posts not found');

    posts = posts.map(post=>{
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
    });

    res.status(200).send(posts);
});

router.post('/user/image', [auth, imageUpload('posts')], async (req, res, next)=> {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found');

    const {error, value} = postJoiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid post object');

    const post =  new Post({
        title:value.title,
        postImage:req.imageDetails.downloadUrl,
        user:userId,
        postType:'userPost'
    });

    result = await post.save();

    res.status(201).send({
        _id:result._id,
        title:result.title,
        user:result.user,
        imageUploadUrl:req.imageDetails.uploadUrl,
        imageDownloadUrl:req.imageDetails.downloadUrl,
    });
});

router.post('/user/text', [auth], async (req, res, next)=> {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found');

    const {error, value} = postJoiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid post object');

    if(!value.postText) return res.status(400).send('Text content not found');

    const post =  new Post({
        title:value.title,
        postText:value.postText,
        user:userId,
        postType:'userPost'
    });

    result = await post.save();

    res.status(201).send(result);
});

router.post('/community/:communityId/image', [auth, validObjectId('communityId'),imageUpload('posts')], async (req, res, next)=> {
    const communityId = req.params.communityId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found');

    const community = await Community.findById(communityId);
    if(!community) return res.status(404).send('Community not found');

    const {error, value} = postJoiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid post object');

    const post =  new Post({
        title:value.title,
        user:userId,
        postType:'communityPost',
        community:communityId,
        postImage:req.imageDetails.downloadUrl
    });

    result = await post.save();

    res.status(201).send({
        _id:result._id,
        title:result.title,
        user:result.user,
        imageUploadUrl:req.imageDetails.uploadUrl,
        imageDownloadUrl:req.imageDetails.downloadUrl,
        community:communityId,
    });


});


router.post('/community/:communityId/text', [auth, validObjectId('communityId')], async (req, res, next)=> {
    const communityId = req.params.communityId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if(!user) return res.status(404).send('User not found');

    const community = await Community.findById(communityId);
    if(!community) return res.status(404).send('Community not found');

    const {error, value} = postJoiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid post object');

    if(!value.postText) return res.status(400).send('A post should contain either image or text');

    const post =  new Post({
        title:value.title,
        postText:value.postText,
        user:userId,
        postType:'communityPost',
        community:communityId
    });

    result = await post.save();

    res.status(201).send(result);


});

router.delete('/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const userId = req.user.id;
    const id= req.params.id;

    const post = await Post.findById(id).populate('user', 'name userName _id image').populate('community', 'name managers owner');
    console.log(post);
    if(!post) return res.status(404).send('Post not found');

    if(post.postType === 'communityPost'){
        if(post.user._id.equals(userId) || post.community.managers.includes(userId) || post.community.owner.equals(userId)){   //whole condition not checked
            const result = await post.remove();
            res.status(200).send(result);
        }
        else{
            return res.status(403).send('User does not have the permission to remove this post');
        }
    }
    else{
        if(post.user._id.equals(userId)){
            const result = await post.remove();
            res.status(200).send(result);
        }
        else{
            return res.status(403).send('User does not have the permission to remove this post');
        }
    }

});

router.post('/like/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;
    const userId = req.user.id;
    const post = await Post.findById(id);
    if(!post) return res.status(404).send('Post item not found');

    if(!post.likes.includes(userId)) post.likes.push(userId);
    const result = await post.save();

    res.status(200).send(result);
});

router.delete('/like/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;
    const userId = req.user.id;
    const post = await Post.findById(id);
    if(!post) return res.status(404).send('Post item not found');

    if(!post.likes.includes(userId)) return res.status(400).send('User did not like the post');
    post.likes.splice(post.likes.indexOf(userId),1);
    const result = await post.save();

    res.status(200).send(result);
});

router.get('/likes/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;

    const post = await Post.findById(id).populate('likes', 'name userName _id image');
    if(!post) return res.status(404).send('Post item not found');

    res.status(200).send(post.likes);
});

router.get('/comments/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;
    const post = await Post.findById(id).populate('comments.user', 'name userName _id image');
    if(!post) return res.status(404).send('Post item not found');

    res.status(200).send(post.comments);

});

router.post('/comments/:id', [auth, validObjectId('id')], async (req, res, next)=> {
    const id= req.params.id;
    const post = await Post.findById(id).populate('comments.user', 'name userName _id image');

    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).send('User not found');

    if(!post) return res.status(404).send('Post item not found');

    if(!req.body.commentText) return res.status(400).send('Comment text not found');

    const comment = {
        user:req.user.id,
        text:req.body.commentText
    };

    post.comments.push(comment);

    let result = await post.save()
    result =await Post.findById(id).populate('comments.user', 'name userName _id image');

    res.status(200).send(result.comments);
});

router.delete('/comments/:postId/:id', [auth, validObjectId('id'),validObjectId('postId')], async (req, res)=>{
    const commentId = req.params.id;
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    const commentIndex = post.comments.findIndex(x=>x._id.equals(commentId));
    if(commentIndex<0) return res.status(404).send('comment not found');
    const comment = post.comments[commentIndex];
    console.log(comment.user, post.user, req.user.id,post.user.equals(req.user.id));
    if(!comment.user.equals(req.user.id) && !post.user.equals(req.user.id)) return res.status(403).send('user cannot perform this operation');

    post.comments.splice(commentIndex,1);

    let result = await post.save()
    result =await Post.findById(postId).populate('comments.user', 'name userName _id image');
    res.status(200).send(result.comments);
});
//Create delete comments option



module.exports = router;