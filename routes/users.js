const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {userMongooseSchema, userJoiSchema}=require('../models/user');
const auth = require('../middlewares/auth');
const validObjectId = require('../middlewares/validObjectId');
const imageUpload = require('../middlewares/image-upload');
const {postJoiSchema, postMongooseSchema} = require('../models/post');
const {getRandomCoverImage} = require('../aws/cover-image');

const User = mongoose.model("User", userMongooseSchema);

const {userLoginJoiSchema, userLoginMongooseSchema} = require('../models/user-login');

const UserLogin = mongoose.model('UserLogin', userLoginMongooseSchema);
const Post = mongoose.model("Post", postMongooseSchema);


router.get('/username-available/:uname', async (req, res, next)=>{
    const userName = req.params.uname;
    const user = await User.findOne({userName});
    if(user) return res.status(409).send();
    else return res.status(200).send();
})

router.get('/search/:key', async (req, res, next)=> {
    const key = req.params.key;
    const regX = new RegExp('.*'+key+'.*','i'); //Make a bit more complex
    const users = await User.find()
                            .or({userName:regX, name:regX})
                            .select('name userName image _id');
    if(!users) return res.status(404).send('Users not found');
    if(users.length == 0)  return res.status(404).send('Users not found');

    res.status(200).send(users);
});

router.get('/search/:key/skill/:skillId',validObjectId('skillId'), async (req, res,next)=>{
    const key = req.params.key;
    const regX = new RegExp('.*'+key+'.*','i'); //Make a bit more complex
    const users = await User.find({skills:req.params.skillId})
                            .or({userName:regX, name:regX})
                            .select('name userName image _id');
    if(!users) return res.status(404).send('Users not found');
    if(users.length == 0)  return res.status(404).send('Users not found');

    res.status(200).send(users);
})



router.post('/', [imageUpload('profileImages')], async (req, res, next)=>{
    const body = req.body;
    const {error, value } = userJoiSchema.validate(body);
    if(error) return res.status(400).send(error);

    try{
        const user = new User({
            email:value.email,
            userName:value.userName,
            name:value.name,
            skills:value.skills,
            image:req.imageDetails.downloadUrl,
            coverImage:'https://picsum.photos/200/300',
            bio:value.bio,
        });
        const userLogin = await UserLogin.findOne({email:value.email});
        if(!userLogin) return res.status(401).send('access denied');

        userLogin.user = user._id;
        await userLogin.save();
        await user.save();
        res.status(201).send({
            email:user.email,
            userName:user.userName,
            name:user.name,
            skills:user.skills,
            image:req.imageDetails.downloadUrl,
            coverImage:'https://picsum.photos/200/300',
            bio:user.bio,
            imageUploadUrl:req.imageDetails.uploadUrl,
        });
    }
    catch(ex){
        if(ex.code==11000){
            if(ex.keyPattern.userName ===1 ) res.status(409).send('username not available')
            else if(ex.keyPattern.email ===1) res.status(409).send('email not available')
        }
        return res.status(500).send(ex.message);
    }
})

router.get('/', auth, async (req, res, next)=>{   //Own profile
    console.log('getting user');
    const id= req.user.id;//check this

    const user = await User.findById(id)
                            .populate('blocked', 'name userName _id image')
                            .populate('following', 'name userName _id image')
                            .populate('skills');
    if(!user) return res.status(404).send('User not found');

    const followers = await User.find({following:user._id}).select('name userName _id image');

    const postLikes = await Post.find({user:user._id}).select('likes');
    let likeCount = 0;
    for (let like of postLikes) {
        likeCount+=like.likes.length;
    }

    
    res.status(200).send({
        _id:user._id,
        email:user.email,
        userName:user.userName,
        name:user.name,
        image:user.image,
        coverImage:getRandomCoverImage(),
        bio:user.bio,
        skills:user.skills,
        private:user.private,
        followersCount:followers.length,
        followingCount:user.following.length,
        likeCount,
    });

});

router.get('/following', auth, async (req, res, next)=>{  //Own following

    const id= req.user.id;

    const user = await User.findById(id).populate('following', 'name userName _id image');

    if(!user) return res.status(404).send('User not found');

    res.status(200).send(user.following);

});

router.get('/:id/following', [auth, validObjectId('id')], async (req, res, next)=>{  //Own following
    const user = await User.findById(req.params.id).populate('following', 'name userName _id image');

    if(!user) return res.status(404).send('User not found');

    res.status(200).send(user.following);
});

router.get('/followers', auth, async (req, res)=>{
    const user = await User.findById(req.user.id)
                            .populate('following', 'name userName _id image')
    const followers = await User.find({following:user._id}).select('name userName _id image');
    res.status(200).send(followers)
})

router.get('/:id/followers', [auth, validObjectId('id')], async (req, res)=>{
    const user = await User.findById(req.params.id)
                            .populate('following', 'name userName _id image')
    const followers = await User.find({following:user._id}).select('name userName _id image');
    res.status(200).send(followers)
})

router.get('/communities', auth, async (req, res, next)=>{    //Own communities

    const id= req.user.id;

    const user = await User.findById(id);

    if(!user) return res.status(404).send('User not found');

    res.status(200).send(user.communities);

});

router.post('/follow/:id', [auth, validObjectId('id')], async (req, res, next)=>{  //Need token
    const user = await User.findById(req.user.id);
    const beingFollowed = req.params.id;
    if(req.user.id === beingFollowed) return res.status(400).send('Follow id cannot be same as profile id')

    const beingFollowedUser = await User.findById(beingFollowed);   //test

    if(!user) return res.status(404).send('User not found');
    if(!beingFollowedUser) return res.status(404).send('User not found');

    if(!user.following.includes(beingFollowed)) user.following.push(beingFollowed);

    const result = user.save();
    
    res.status(200).send(result);
});

router.delete('/follow/:id', [auth, validObjectId('id')], async (req, res, next)=>{ //Untested
    const user = await User.findById(req.user.id);
    const beingUnFollowed = req.params.id;
    if(!user) return res.status(404).send('User not found');

    if(!user.following.includes(beingUnFollowed)) return res.status(404).send('user not followed');

    user.following.splice(user.following.indexOf(beingUnFollowed),1);

    const result = await user.save();
    
    return res.status(200).send(result);
});

router.put('/', [auth, imageUpload('profileImages')], async (req, res, next)=>{     //Update profile
    const id = req.user.id;

    const user = await User.findById(id);
    const {error, value} = userJoiSchema.validate(req.body);

    if(error) return res.status(400).send(error);

    user.set({
        ...value,
        image:req.imageDetails.downloadUrl,
    });

    const result = await user.save();

    res.status(200).send(
        {email:user.email,
            userName:user.userName,
            name:user.name,
            skills:user.skills,
            image:req.imageDetails.downloadUrl,
            coverImage:'https://picsum.photos/200/300',
            bio:user.bio,
            imageUploadUrl:req.imageDetails.uploadUrl,});
});

router.put('/without-image', [auth,], async (req, res, next)=>{     //Update profile
    const id = req.user.id;
    console.log(req.body);
    const user = await User.findById(id);
    const {error, value} = userJoiSchema.validate(req.body);

    if(error) return res.status(400).send(error);

    user.set(value);

    const result = await user.save();

    res.status(200).send(
        {email:user.email,
            userName:user.userName,
            name:user.name,
            skills:user.skills,
            image:user.image,
            coverImage:'https://picsum.photos/200/300',
            bio:user.bio,
            });
});

router.post('/block/:id', validObjectId('id'), auth, async (req, res, next)=>{   //Block profile
    const user = req.user.user;

    const beingBlocked = req.params.id;
    if(!beingBlocked) return res.status(404).send('User not found');


    if(beingBlocked == req.user.id) return res.status(400).send('Cannot block yourself');
    if(!user.blocked.includes(beingBlocked)) user.blocked.push(beingBlocked);
    if(user.following.includes(beingBlocked)){
        user.following.splice(user.following.indexOf(beingBlocked),1);
    }

    const result = await user.save();
    
    res.status(200).send(result);
    
});

router.get('/blocked', auth, async (req, res, next)=>{
    const blocked = await User.findById(req.user.id).populate('blocked','name userName _id image');
    res.status(200).send(blocked.blocked);
})

router.delete('/block/:id', validObjectId('id'), auth, async (req, res, next)=>{ //Unblock profile
    const user = await User.findById(req.user.id);

    if(!user) return res.status(404).send('User not found');

    const beingUnBlocked = req.params.id;
    if(!user.blocked.includes(beingUnBlocked)) return res.status(400).send('user not blocked');
    
    user.blocked.splice(user.blocked.indexOf(beingUnBlocked),1);

    const result = await user.save();
    
    res.status(200).send(result);
});

router.post('/private', auth, async (req, res, next)=>{     //Make account private or not
    const user = await User.findById(req.user.id);

    if(!user) return res.status(404).send('User not found');

    if(!req.body.isPrivate) return res.status(400).send('isPrivate value not found');

    user.private = req.body.isPrivate;

    const result = await user.save();
    
    res.status(200).send(result);
});


router.get('/:id', [auth,validObjectId('id')], async (req, res, next)=>{
    
    const id = req.params.id;

    if(req.user.user.blocked.includes(id)) return res.status(404).send('User not found'); //But is actually blocked
    
    const owner = await User.findById(req.user.id).select('following');
    
    const user = await User.findById(id).populate('blocked', 'name userName _id image')
    .populate('following', 'name userName _id image')
    .populate('skills');;
    if(!user) return res.status(404).send('User not found');

    const followers = await User.find({following:user._id}).select('name userName _id image');



    const postLikes = await Post.find({user:user._id}).select('likes');
    let likeCount = 0;
    for (let like of postLikes) {
        likeCount+=like.likes.length;
    }

    res.status(200).send({
        _id:user._id,
        email:user.email,
        userName:user.userName,
        name:user.name,
        image:user.image,
        coverImage:getRandomCoverImage(),
        bio:user.bio,
        skills:user.skills,
        private:user.private,
        followersCount:followers.length,
        followingCount:user.following.length,
        isFollowing:owner.following.includes(user._id),
        likeCount,
    });
});

router.get('/:id/following', validObjectId('id'), async (req, res, next)=>{
    const id= req.params.id;

    const user = await User.findById(id);
    
    if(!user) return res.status(404).send('User not found');

    res.status(200).send(user.following);
});

router.get('/:id/communities', validObjectId('id'), async (req, res, next)=>{
    const id= req.params.id;
    const user = await User.findById(id);
    
    if(!user) return res.status(404).send('User not found');

    res.status(200).send(user.communities);
});



//TODO: Delete user's data

module.exports = router;