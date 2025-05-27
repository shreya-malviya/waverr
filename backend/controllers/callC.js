const catchAsyncerrors = require("../middleware/catchAsyncerrors");
const CallHistory = require('../models/callM')
const User = require('../models/userM')
const { getReceiverSocketId, io } = require("../app");
const moment = require('moment');
const ErrorHandler = require("../utils/errorHandler");
/*
const callSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      ],
      startedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['audio', 'video'], required: true },
      callDuration:{type:Number},
      startedAt: { type: Date, default: Date.now },
      endedAt: { type: Date, default: Date.now },
      duration: Number, // in seconds
      status: {
        type: String,
        enum: ['missed', 'ended', 'rejected'],
        default: 'ended'
      },
},{timestamps:true})
*/


exports.startCall = catchAsyncerrors(async (req, res, next) => {
    const { callType } = req.body;
    if (!['audio', 'video'].includes(callType)) return next(new ErrorHandler('invalid call type', 400))
    const date = Date.now();
    const userId = req.user.id;
    const { id: receiverId } = req.params;
    const callData = {
        startedAt: date,
        startedBy: userId,
        type: callType,
        participants: [userId, receiverId],
    };
    console.log("call started from ", userId, " to : ", receiverId);
    const call = await CallHistory.create(callData)
    const user = await User.findById(userId).select('-password');
    const receiver = await User.findById(receiverId).select('-password');


    // const userM = update the last message to call status;\\ 
    const socketId = getReceiverSocketId(receiverId);
    if (socketId && io) {
        io.to(socketId).emit("incomingCall", {
            callFrom: userId,
            callerDetails: user,
            startedAt: date,
            callDetails: call,
            receiverDetails: receiver,
            receiverId: receiverId
        })
    }
    else {
        await CallHistory.findByIdAndUpdate(call._id, {
            status: "missed",
            endedAt: Date.now()
        });
    }
    res.status(200).json({
        callFrom: userId,
        callerDetails: user,
        startedAt: date,
        callDetails: call,
        receiverDetails: receiver,
        receiverId: receiverId
    })
})

//handling rejected case
exports.callReject = catchAsyncerrors(async (req, res, next) => {
    const { incomingCall: data } = req.body;
    const currentTime = Date.now();
    const durationMs = currentTime - new Date(data.startedAt); // duration in milliseconds

    const updatedCall = await CallHistory.findByIdAndUpdate(
        data.callDetails._id,
        {
            duration: durationMs,
            endedAt: currentTime,
            status: 'rejected'
        },
        { new: true }
    );
    const socketId = getReceiverSocketId(data.callFrom);
    if (socketId && io)
        io.to(socketId).emit("callRejected", { status: "rejected" })
    res.status(200).json({ success: true, message: 'call rejected', updatedCall })
})

exports.callAccept = catchAsyncerrors(async (req, res, next) => {
    try {
        const { incomingCall: data } = req.body;
        const socketId = getReceiverSocketId(data.callFrom);
        if (socketId && io)
            io.to(socketId).emit("callAccepted", { data })
        res.status(200).json({ success: true, message: 'call accept' })
    } catch (error) {
        console.log(error);
    }
})

//handling ending cases
exports.callEnd = catchAsyncerrors(async (req, res, next) => {
    const { incomingCall: data } = req.body;
    if (!data) return next(new ErrorHandler("no data to end a call", 400))
    const currentTime = Date.now();
    const durationMs = currentTime - new Date(data.startedAt); // duration in milliseconds

    const updatedCall = await CallHistory.findByIdAndUpdate(
        data.callDetails._id,
        {
            duration: durationMs,
            endedAt: currentTime,
            status: 'ended'
        },
        { new: true }
    );
    const senderSocketId = getReceiverSocketId(data.callFrom)
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    if (receiverSocketId && io)
        io.to(receiverSocketId).emit("callEnd", { data })
    if (senderSocketId && io)
        io.to(senderSocketId).emit("callEnd", { data })
    res.status(200).json({ success: true, message: 'call rejected', updatedCall, data })
})




//  show calling history 
exports.callHistory = catchAsyncerrors(async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await CallHistory.find({
            participants: { $all: [userId] }
        }).select("-participants").sort({ createdAt: -1 })
            .populate({
                path: 'participants',
                match: { _id: { $ne: userId } },
                select: '-password'
            });

        res.status(200).json({ result })

    } catch (error) {
        console.log(error);
    }
})