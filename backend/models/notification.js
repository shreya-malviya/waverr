const mongoose = require('mongoose') ;

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who triggered the notification
  type: {
    type: String,
    enum: ['message', 'call', 'invite', 'friendRequest'],
    required: true
  },
  data: mongoose.Schema.Types.Mixed, // flexible payload (messageId, callId, etc.)
  isSeen: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports =  mongoose.model('Notification', notificationSchema);
