const mongoose = require('mongoose')

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

module.exports = mongoose.model('CallHistory',callSchema);