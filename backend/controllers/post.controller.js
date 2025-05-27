const Post = require('../models/postModel');
const catchAsyncerrors = require("../middleware/catchAsyncerrors");
const User = require("../models/userM");
const Profile = require("../models/profileM");
const cloudinary = require("../config/cloudinary");
const ErrorHandler = require('../utils/errorHandler');
const { ObjectId } = require("mongoose").Types;

// {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true
//         },
//         profile: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Profile',
//             required: true
//         },
//         location:{
//             type:String,
//             maxlength: [50, 'location too long']
//         },
//         caption: {
//             type: String,
//             maxlength: [100, 'Caption too long']
//         },
//         media: [
//             {
//                 url: { type: String, required: true },
//                 type: { type: String, enum: ['image', 'video'], required: true, default:'image' }
//             }
//         ],
//         commentsEnabled: { type: Boolean, default: true },
//         comments: [
//             {
//                 user: {
//                     type: mongoose.Schema.Types.ObjectId,
//                     ref: 'User',
//                     required: true
//                 },
//                 message: {
//                     type: String,
//                     minlength: [1, "Comment can't be empty"],
//                     maxlength: [100, 'Comment too long']
//                 },
//                 createdAt: { type: Date, default: Date.now }
//             }
//         ],
//         likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//         taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//         visibility: {
//             type: String,
//             enum: ['public', 'private', 'friends'],
//             default: 'public'
//         }
//     },


exports.postSomething = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;
    const { image = '', caption = '', location = '', commentsEnabled = true, visibility = 'public' } = req.body;

    const profile = await Profile.findOne({ user: userId });
    const documentData = {
        user: userId,
        profile: profile._id,
        caption,
        location,
        commentsEnabled,
        visibility,
    };
    if(!image) return next(new ErrorHandler("no image to process",400))
    if (image) {
        try {
            const uploadData = await cloudinary.uploader.upload(image,
                { folder: 'Posts' }
            );
            documentData.media = [
                {
                    url: uploadData.secure_url,
                    type: uploadData.resource_type === 'video' ? 'video' : 'image' // optional
                }
            ];
        } catch (error) {
            console.log('error while uploading post to the cloud ', error)
            return next(new ErrorHandler("unable to upload on the cloud", 400))
        }
    }
    const post = await Post.create(documentData);
    profile.posts.push(post._id);
    await profile.save();
    res.status(200).json({ post });
})

exports.findPost = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId)
        .populate({
            path: "user",
            select: "firstName avatar"
        })
        .populate({
            path: "comments.user",
            select: "firstName avatar"
        });

    if (!post) return next(new ErrorHandler("Post not found", 404));

    // fetch the profile of the post creator
    const profile = await Profile.findOne({ user: post.user._id });

    if (!profile) return next(new ErrorHandler("Profile not found", 404));

    const isPublic = profile.profileVisibility === "public";
    const isFriend = (profile.friends || []).some(
        friendId => friendId.toString() === userId.toString()
    );
    const isOwner = post.user._id.toString() === userId.toString();

    if (!isPublic && !isFriend && !isOwner) {
        return next(new ErrorHandler("Not authorized to view this post", 403));
    }

    const isLiked = (post.likes || []).some(
        likeId => likeId.toString() === userId.toString()
    );

    // attach like status if needed
    const responsePost = {
        ...post.toObject(),
        alreadyLiked: isLiked
    };

    res.status(200).json({ post: responsePost });
})

exports.addComment = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;
    const { id: postId } = req.params;
    const { comment } = req.body;
    const post = await Post.findById(postId);
    if (!post) return next(new ErrorHandler("Post not found", 404));

    if (!post.commentsEnabled) {
        return next(new ErrorHandler("comments are disabled", 400))
    }
    const commentData = {
        user: userId,
        message: comment,
        createdAt: new Date()
    };

    post.comments.push(commentData);
    await post.save();

    res.status(200).json({ post });
})

exports.likePost = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return next(new ErrorHandler("Post not found", 404));

    // Avoid duplicate likes
    const alreadyLikedIndex = post.likes.findIndex(
        (like) => like.toString() === userId
    );

    let likedByUser;
    if (alreadyLikedIndex > -1) {
        post.likes.splice(alreadyLikedIndex, 1);
        likedByUser = false;

    } else {
        post.likes.push(userId);
        likedByUser = true;
    }

    await post.save();

    res.status(200).json(
        {
            postId: post._id,
            totalLikes: post.likes.length,
            likedByUser: true
        });
})

exports.fetchAllPosts = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;

    const posts = await Post.aggregate([
        {
            $lookup: {
                from: "profiles",
                localField: "profile",
                foreignField: "_id",
                as: "profileData"
            }
        },
        {
            $unwind: "$profileData"
        },
        {
            $match: {
                $or: [
                    { "profileData.profileVisibility": "public" },
                    {
                        $and: [
                            { "profileData.profileVisibility": "private" },
                            { "profileData.friends": new ObjectId(userId) }
                        ]
                    },
                    { user: new ObjectId(userId) }
                ]
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);

    const postIds = posts.map(p => p._id);
    const populatedPosts = await Post.find({ _id: { $in: postIds } })
        .populate({
            path: "comments.user",
            select: "firstName avatar"
        })
        .populate({
            path: "user", // optional if you want to show post owner's name
            select: "firstName avatar"
        })
        .sort({ _id: -1 });

    const finalPosts = populatedPosts.map(post => {
        const alreadyLiked = (post.likes || []).some(
            likeId => likeId.toString() === userId
        );
        return {
            ...post.toObject(),
            alreadyLiked
        };
    });

    res.status(200).json({ posts: finalPosts });
});

exports.fetchOurPosts = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;
    const posts = await Post.find({ user: userId })
        .sort({ _id: -1 })
        .populate({
            path: 'comments.user',
            select: 'firstName avatar'
        });
    const updatedPosts = posts.map(post => {
        const isLiked = (post.likes || []).some(like => like.toString() === userId);
        return {
            ...post.toObject(),
            alreadyLiked: isLiked
        };
    });
    res.status(200).json({ updatedPosts });
})

exports.deletePost = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;
    const { id: postId } = req.params;
    if(postId === 'false') return next(new ErrorHandler("false...",400))
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return next(new ErrorHandler("Profile not found", 404));

    const postExistsInProfile = (profile?.posts ?? []).some(p => p.toString() === postId);
    if (!postExistsInProfile) {
        return next(new ErrorHandler("You cannot delete someone else's post", 403));
    }
    const postDetails = await Post.findById(postId);

    if(postDetails.media[0].url){
        const publicId = extractPublicId(postDetails.media[0].url);
        await cloudinary.uploader.destroy(publicId);
    }
    

    

    const post = await Post.findByIdAndDelete(postId);
    if (!post) return next(new ErrorHandler("Post not found", 404));

    // Remove post from profile's posts array
    profile.posts.pull(postId);
    await profile.save();

    res.status(200).json({ success: true, message: "Post deleted successfully" });
});

exports.modifyControl = catchAsyncerrors(async (req, res, next) => {
    const userId = req.user.id;

})


const extractPublicId = (url) => {
  const parts = url.split('/');
  const fileWithExtension = parts[parts.length - 1]; // abc123xyz.jpg
  const fileName = fileWithExtension.split('.')[0];  // abc123xyz
  const folderName = parts[parts.length - 2];        // posts or uploads/...

  return `${folderName}/${fileName}`; // e.g., posts/abc123xyz
};