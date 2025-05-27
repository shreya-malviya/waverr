const catchAsyncerrors = require("../middleware/catchAsyncerrors");
const User = require("../models/userM");
const Profile = require("../models/profileM");
const cloudinary = require("../config/cloudinary");
const Post = require('../models/postModel');
const ErrorHandler = require("../utils/errorHandler");
const Story = require('../models/storyModel');

const extractPublicId = (url) => {
  const parts = url.split('/');
  const fileWithExtension = parts[parts.length - 1]; // abc123xyz.jpg
  const fileName = fileWithExtension.split('.')[0];  // abc123xyz
  const folderName = parts[parts.length - 2];        // posts or uploads/...

  return `${folderName}/${fileName}`; // e.g., posts/abc123xyz
};



exports.updateProfile = catchAsyncerrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    const profile = await Profile.findOne({ user: req.user.id });
    let obj = { user, profile };

    res.status(200).json({ success: true, details: obj })
})

exports.handleProfileUpdate = catchAsyncerrors(async (req, res, next) => {
    const { firstName, lastName, bio, gender, avatar ,location,birthday,statusText, profileVisibility} = req.body;

    // Prepare user update object
    let updateUserData = {};
    if (firstName) updateUserData.firstName = firstName;
    if (lastName) updateUserData.lastName = lastName;

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Handle avatar upload
    if (avatar && avatar.startsWith('data:image')) {
        try {
            // If user already has an avatar, delete it from Cloudinary
            const publicId = extractPublicId(user.avatar.public_id);
            if (user.avatar && publicId) {
                await cloudinary.uploader.destroy(publicId);
            }

            const uploadedResponse = await cloudinary.uploader.upload(avatar, {
                folder: 'avatars',
                resource_type: 'image'
            });

            updateUserData.avatar = {
                public_id: uploadedResponse.public_id,
                url: uploadedResponse.secure_url
            };
        } catch (err) {
            console.error("Avatar upload failed:", err);
        }
    }

    // Apply user update
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateUserData, { new: true }).select('-password');

    // Prepare profile update
    let updateProfileData = {};
    if (bio !== undefined) updateProfileData.bio = bio;
    if (gender !== undefined) updateProfileData.gender = gender;
    if (location) updateProfileData.location = location;
    if (birthday) updateProfileData.birthday = birthday;
    if (statusText) updateProfileData.statusText = statusText;
    if(profileVisibility) updateProfileData.profileVisibility = profileVisibility;
    const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        updateProfileData,
        { new: true, upsert: true }
    );

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
        profile: updatedProfile
    });
})


exports.showProfile = catchAsyncerrors(async(req,res,next)=>{
    const userId = req.user.id;
    const user = await User.findById(userId);
    const profile = await Profile.find({user:userId});
    if(!user || !profile) return next(new ErrorHandler("Something went wrong",400))
    res.status(200).json({user,profile})
})


exports.selectedProfile = catchAsyncerrors(async (req, res, next) => {
    const viewerId = req.user.id;
    const { id: targetId } = req.params;

    // Fetch current user's profile (to check friends)
    const userProfile = await Profile.findOne({ user: viewerId });

    // Fetch target profile minimally to check visibility
    const targetProfileBasic = await Profile.findOne({ user: targetId })
        .select('profileVisibility friends user');

    if (!targetProfileBasic) return next(new ErrorHandler('Profile not found', 404));

    const isUser = viewerId.toString() === targetId.toString();
    const isFriend = (targetProfileBasic.friends || []).some(friend => friend.toString() === viewerId.toString());
    const isPublic = targetProfileBasic.profileVisibility === 'public';

    if (!isPublic && !isFriend && !isUser) {
  // Still return `profile` and `you` keys to keep structure same
  const minimalUser = await User.findById(targetId).select('firstName lastName avatar');

  return res.status(200).json({
    profile: {
      user: minimalUser,
      posts: [],
      you: userProfile,
      restricted: true
    }
  });
}


    // Now fetch full target profile with posts only if authorized
    const targetProfile = await Profile.findOne({ user: targetId })
        .populate({
            path: 'user',
            select: 'avatar firstName lastName',
        })
          .populate({
    path: 'posts',
        options: { sort: { createdAt: -1 } }, // 👈 sort by recent

    populate: [
      {
        path: 'user',
        select: 'firstName lastName avatar',
      },
      {
        path: 'comments.user', // nested path to populate
        select: 'firstName lastName avatar',
      }
    ]
  });

    
        const profileObject = targetProfile.toObject();

    profileObject.posts = (profileObject.posts || []).map(post => {
        const alreadyLiked = post.likes.some(likeId => likeId.toString() === viewerId.toString());
        return {
            ...post,
            alreadyLiked
        };
    });

    res.status(200).json({
        profile: {
            ...profileObject,
            you: userProfile
        }
    });
});


// handling stories for profiles 

// fetching stories  
exports.getFriendStories = catchAsyncerrors( async (req, res, next) => {
    const viewerId = req.user.id;

    await Story.deleteMany({ expiresAt: { $lte: new Date() } });

    const profile = await Profile.findOne({ user: viewerId }).select('friends');
    if (!profile) return next(new ErrorHandler("profile not found",400))

    const friendIds = profile?.friends ?? [];
    
    const yourStory = await Story.find({user:viewerId}).populate('user', 'firstName lastName avatar')
    
    const stories = await Story.find({
      user: { $in: friendIds },
      expiresAt: { $gt: new Date() }
    }).populate('user', 'firstName lastName avatar');

    res.status(200).json({ friendsStories: stories , yourStory: yourStory  });
});

// posting a story
exports.postStory =catchAsyncerrors( async (req, res, next) => {
    const userId = req.user.id;
    const {story} = req.body;

    if(!story) return next(new ErrorHandler("error while uploading the image",400));

    const existingStory  = await Story.findOne({user:userId});
    if(existingStory) {
        const publicId = extractPublicId(existingStory.image);
        if(publicId) if (publicId) await cloudinary.uploader.destroy(publicId);
        await Story.findByIdAndDelete(existingStory._id);
    }

    const uploadData = await cloudinary.uploader.upload(story,{
        folder: 'stories',
        resource_type: 'image'
    });
    const newStory = await Story.create({
        user: userId,
        image: uploadData.secure_url
    })

    res.status(200).json({
        newStory
    })
});

exports.deleteStory =catchAsyncerrors( async (req, res, next) => {
    const userId = req.user.id;
    const {id: storyId} = req.params;

    const existingStory  = await Story.findById(storyId);
    if(existingStory.user.toString() !== userId ) return next(new ErrorHandler("you can only delete your story ",404))
    if(!existingStory) return next(new ErrorHandler("no story found with this id",400))
    if(existingStory) {
        const publicId = extractPublicId(existingStory.image);
        if(publicId) if (publicId) await cloudinary.uploader.destroy(publicId);
        await Story.findByIdAndDelete(existingStory._id);
    }
    await Story.findByIdAndDelete(storyId);
    res.status(200).json({
        success:true
    })
});


exports.getSingleStory =catchAsyncerrors( async (req, res, next) => {
    const userId = req.user.id;
    const {id: storyId} = req.params;
    const existingStory  = await Story.findByIdAndDelete(storyId);
    if(!existingStory) return next(new ErrorHandler("no story found with this id",400))
    const targetProfile = await Profile.find({user: existingStory.user});

    const isFriend = (targetProfile.friends || []).some(friend => friend.toString() === userId.toString());
    if(!isFriend) return next(new ErrorHandler("unauthorized",404));
    

    res.status(200).json({
        existingStory
    })
});
