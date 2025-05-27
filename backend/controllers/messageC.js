const cloudinary = require("../config/cloudinary");
const { getReceiverSocketId, io } = require("../app") ;
const catchAsync = require("../middleware/catchAsyncerrors");
const Conversation = require('../models/conversationM')
const Message = require('../models/messagesM');
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userM");

// supports one-to-one only right now
exports.sendMessage = catchAsync(async(req,res,next)=>{
  const  { id: receiverId }  = req.params;
  const { text ='', image = '',type = '', isGroup = false, isCommunity = false } = req.body;
  if (!text && !image) {
    return next(new ErrorHandler("Message must contain text or image.",400))
  }
  const senderId = req.user._id;
  let imgString = null;
  if(image){
    imgString = await cloudinary.uploader.upload(image);
    imgString = imgString.secure_url;
  }
  let messageType = 'text';
  if (text && image) messageType = 'mixed';
  else if (image) messageType = 'image';

  //finding a conversation that includes both the users
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroup: false,
    isCommunity:false
  });

  // creating one if absent
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      createdBy: senderId,
    });
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId, 
    conversation: conversation._id,
    content: { text, image : imgString },
    type: messageType,
    readBy: [{ user: senderId }],
  });
  
  await Conversation.findByIdAndUpdate(conversation._id, {
    $push: { messages: message._id },
  });  

  const receiverSocketId = getReceiverSocketId(receiverId); // you define this helper
  if (receiverSocketId && io) {
    io.to(receiverSocketId).emit("newMessage", message);
  }
  await User.findByIdAndUpdate(req.user.id, {
    userLastMessage: {
      text: text ? text : "Attachment...",
      createdAt: new Date()
    }
  });
  await User.findByIdAndUpdate(receiverId, {
    userLastMessage: {
      text: text ? text : "Attachment...",
      createdAt: new Date()
    }
  });
  res.status(201).json(message);
})

exports.getMessages = catchAsync(async(req,res,next)=>{
  const { id: receiverId }  = req.params;
  const senderId = req.user.id;
  console.log(receiverId , senderId);
  const conversation = await Conversation.findOne({
    participants: { $all : [senderId, receiverId]},
    isGroup : false,
    isCommunity:false
  }).populate({path:'messages'})
  // let conversation = await Conversation.findOne({
  //   participants: { $all: [senderId, receiverId] },
  //   isGroup: false,
  //   isCommunity:false
  // });

  if(!conversation) return res.status(200).json([]);;

  const messages = conversation.messages;
  res.status(200).json({messages});
})


