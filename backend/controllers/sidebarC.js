const catchAsyncerrors = require("../middleware/catchAsyncerrors");
const User = require("../models/userM");
const Profile = require("../models/profileM");
const { getReceiverSocketId, io } = require("../app");
const ErrorHandler = require("../utils/errorHandler");
const Notification = require('../models/notification')
const { ObjectId } = require("mongoose").Types;
const Conversation = require('../models/conversationM')
//  message section PVT

exports.getUsersForSideBar = catchAsyncerrors(async (req, res, next) => {
  const currentUserId = req.user.id;

  const filteredUsers = await Profile.aggregate([
  // Match the current user's profile
  {
    $match: { user: new ObjectId(currentUserId) }
  },
  // Unwind the friends array to process each friend individually
  {
    $unwind: '$friends'
  },
  // Rename the friend ID for clarity
  {
    $addFields: {
      friendId: '$friends'
    }
  },
  // Lookup the friend's user document to get firstName, lastName, and avatar
  {
    $lookup: {
      from: 'users',
      localField: 'friendId',
      foreignField: '_id',
      as: 'friendUser'
    }
  },
  {
    $unwind: '$friendUser'
  },
  // Lookup the conversation between the current user and the friend
  {
    $lookup: {
      from: 'conversations',
      let: { friendId: '$friendId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $in: [new ObjectId(currentUserId), '$participants'] },
                { $in: ['$$friendId', '$participants'] },
                { $eq: ['$isGroup', false] },
                { $eq: ['$isCommunity', false] }
              ]
            }
          }
        }
      ],
      as: 'conversation'
    }
  },
  {
    $unwind: {
      path: '$conversation',
      preserveNullAndEmptyArrays: true
    }
  },
  // Lookup the latest message in the conversation
  {
    $lookup: {
      from: 'messages',
      let: { convoId: '$conversation._id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$conversation', '$$convoId'] }
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
        {
          $project: {
            content: 1,
            createdAt: 1
          }
        }
      ],
      as: 'lastMessage'
    }
  },
  {
    $unwind: {
      path: '$lastMessage',
      preserveNullAndEmptyArrays: true
    }
  },
  // Project the desired fields
  {
    $project: {
      _id: 0,
      friendId: 1,
      'friendUser.firstName': 1,
      'friendUser.lastName': 1,
      'friendUser.avatar': 1,
      lastMessageText: '$lastMessage.content.text',
      lastMessageTime: '$lastMessage.createdAt'
    }
  },
  // Sort by the timestamp of the latest message, placing those without messages at the end
  {
    $sort: {
      lastMessageTime: -1
    }
  }
]);


  res.status(200).json({ filteredUsers });
});

//  this is to find all the friends
exports.findFriends = catchAsyncerrors(async (req, res, next) => {
  const loggedInuserId = req.user.id;
  const profile = await Profile.findOne({ user: loggedInuserId });
  const friends = profile?.friends ?? [];
  res.status(200).json({ friends })
})

// find all users
exports.searchUsers = catchAsyncerrors(async (req, res, next) => {
  const { search } = req.query;
  const userId = req.user.id;

  if (!search || search.trim() === "") {
    return next(new ErrorHandler("Search term is required", 400));
  }

  const regex = new RegExp(search, 'i');

  // Aggregate over the `users` collection
  const filteredUsers = await User.aggregate([
    {
      $match: {
        $or: [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } }
        ],
        _id: { $ne: userId } // exclude current user from search results
      }
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'user',
        as: 'profileData'
      }
    },
    { $unwind: '$profileData' },
    {
      $addFields: {
        matchScore: {
          $cond: [
            { $regexMatch: { input: '$firstName', regex: new RegExp(`^${search}`, 'i') } }, 2,
            {
              $cond: [
                { $regexMatch: { input: '$lastName', regex: new RegExp(`^${search}`, 'i') } }, 1,
                0
              ]
            }
          ]
        }
      }
    },
     { $match: {
    matchScore: { $gt: 0 }
  }
},
    {
      $project: {
        firstName: 1,
        lastName: 1,
        avatar: 1,
        profileName: '$profileData.profileName',
        matchScore: 1
      }
    },
    {
      $sort: { matchScore: -1 }
    }
  ]).allowDiskUse(true);

  // Fetch the current user's profile separately
  const profile = await Profile.findOne({ user: userId }).populate('user', 'firstName lastName avatar');

  res.status(200).json({
    filteredUsers,
    profile
  });
});


//  this is to search for the freinds includes aggregation pipeline
exports.searchForFriends = catchAsyncerrors(async (req, res, next) => {
  const { search } = req.body;
  if (!search || search.trim() === "") {
    return next(new ErrorHandler("Search term is required", 400));
  }

  const regex = new RegExp(search, 'i');

  const results = await Profile.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'friends',
        foreignField: '_id',
        as: 'userData'
      }
    },
    { $unwind: '$userData' },

    // Create a custom score for relevance
    {
      $addFields: {
        matchScore: {
          $cond: [
            { $regexMatch: { input: '$userData.firstName', regex: new RegExp(`^${search}`, 'i') } }, 3,
            {
              $cond: [
                { $regexMatch: { input: '$userData.lastName', regex: new RegExp(`^${search}`, 'i') } }, 2,
                {
                  $cond: [
                    { $regexMatch: { input: '$profileName', regex: new RegExp(`^${search}`, 'i') } }, 1,
                    0
                  ]
                }
              ]
            }
          ]
        }
      }
    },

    {
      $match: {
        $or: [
          { 'profileName': { $regex: regex } },
          { 'userData.firstName': { $regex: regex } },
          { 'userData.lastName': { $regex: regex } }
        ]
      }
    },

    {
      $project: {
        'userData.firstName': 1,
        'userData.avatar': 1,
        'profileName': 1,
        matchScore: 1
      }
    },

    {
      $sort: { matchScore: -1 }
    }
  ]).allowDiskUse(true);


  res.status(200).json({ results });


})



// find the user for status 
exports.findStatusUsers = catchAsyncerrors(async (req, res, next) => {
  const userId = req.user.id;
  const result = await Profile.findOne({ user: userId })
    .populate({
      path: 'friends',
      select: '-password', // hide password from each populated user
    });

  res.status(200).json({ result })
})


//  Home
exports.getUsersForHomeSideBar = catchAsyncerrors(async (req, res, next) => {
  const loggedInuserId = req.user.id;
  const profile = await Profile.findOne({ user: loggedInuserId });
  let friends = profile?.friends ?? [];
  friends.push(loggedInuserId);
  const filteredUsers = await User.find({ _id: { $nin: friends } }).select("avatar firstName lastName");

  res.status(200).json({ filteredUsers,profile });
})

//  notifications / home updates 
exports.sendFriendReq = catchAsyncerrors(async (req, res, next) => {
  const loggedInuserId = req.user.id;
  const { id: targetUserId } = req.params;

  const user = await User.findById(targetUserId);
  if (!user) return next(new ErrorHandler("target user not found", 404));

  const senderProfile = await Profile.findOne({ user: loggedInuserId });
  if (!senderProfile) return next(new ErrorHandler("something went wrong", 404));

  if (senderProfile.friends.includes(targetUserId)) {
    return next(new ErrorHandler("Friend already exists", 400));
  }

  const existingRequest = senderProfile.friendReqStatus.find(
    (req) =>
      req.user.toString() === targetUserId.toString() &&
      (req.status === "pending" || req.status === "accepted")
  );
  if (existingRequest) {
    return next(new ErrorHandler("Friend request already exists or was accepted", 400));
  }

  // Add request to target user’s profile
  const updatedProfile = await Profile.findOneAndUpdate(
    { user: loggedInuserId },
    {
      $addToSet: {
        friendReqStatus: {
          user: targetUserId,
          status: "pending",
        },
      },
    },
    { new: true }
  );

  if (!updatedProfile) return next(new ErrorHandler("Target profile not found", 404));

  // Create and populate the notification
  const notification = await Notification.create({
    user: targetUserId,
    sender: loggedInuserId,
    type: "friendRequest",
    status: "active",
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate({ path: "sender", select: "-password" }).sort({ _id: -1 });

  // Emit socket event
  const receiverSocketId = getReceiverSocketId(targetUserId);
  if (receiverSocketId && io) {
    io.to(receiverSocketId).emit("newReq", populatedNotification);
  }

  res.status(200).json({ notification: populatedNotification });
});

exports.removeFriendReq = catchAsyncerrors(async (req, res, next) => {
  const userId = req.user.id;
  const { id: targetUserId } = req.params;
  const updatedProfile = await Profile.findOneAndUpdate(
  { user: userId },
  {
    $pull: {
      friendReqStatus: { user: targetUserId },
      friends: targetUserId
    }
  },
  { new: true }
);

await Profile.findOneAndUpdate(
  { user: targetUserId },
  {
    $pull: {
      friendReqStatus: { user: targetUserId },
      friends: userId
    }
  },
  { new: true }
);


  if (!updatedProfile) {
    return next(new ErrorHandler("Friend request not found", 404));
  }
  await Notification.findOneAndDelete(
    {
      user: targetUserId,
      sender: userId,
      type: "friendRequest",
      status: "active"
    },
  );

  const receiverSocketId = getReceiverSocketId(targetUserId);
  if (receiverSocketId && io) {
    io.to(receiverSocketId).emit("removeReq", "restart");
  }
  res.status(200).json({ status: "sucess" })
})


//  updating friend Req -> gonna take accept / reject clear notification / add ids in both of the lists
exports.updateFriendReq = catchAsyncerrors(async (req, res, next) => {
  const userId = req.user.id;
  const {id: targetId} = req.params;
  const {userDecision = null} = req.body; // accept or reject : this will be auto reject

  await Profile.findOneAndUpdate(
    { user: targetId },
    {
      $pull: {
        friendReqStatus: {
          user: userId
        }
      }
    },
    { new: true }
    )
  
  if(userDecision === 'accept'){
    await Profile.updateOne(
      { user: userId },
      { $addToSet: { friends: targetId } } // addToSet avoids duplicates
    );
  
    await Profile.updateOne(
      { user: targetId },
      { $addToSet: { friends: userId } }
    );
  }

  await Notification.findOneAndDelete(
    {
      user: userId,
      sender: targetId,
      type: "friendRequest",
      status: "active"
    },
  );

  const receiverSocketId = getReceiverSocketId(targetId);
  if (receiverSocketId && io) {
    io.to(receiverSocketId).emit("removeReq", "restart");
  }
  const senderSocketId = getReceiverSocketId(userId);
  if (senderSocketId && io) {
    io.to(senderSocketId).emit("removeReq", "restart");
  }
  res.status(200).json({ status: "success" })
})



// notification bar
exports.fetchNotifications = catchAsyncerrors(async(req,res,next)=>{
  const userId = req.user.id;
  const fetchNotifications = await Notification.find({user:userId , status : 'active'}).sort({_id:-1}).populate({path:'sender',select:'-password'})
  const result = fetchNotifications.length === 0 ? [] : fetchNotifications;
  res.status(200).json(result)
})