const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],

  isGroup: {
    type: Boolean,
    default: false,
  },

  isCommunity: {
    type: Boolean,
    default: false,
  },

  messages: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
  ],

  name: {
    type: String,
    default: null, // for group/community
  },

  groupAvatar: {
    type: String,
    default: null,
  },

  communityAvatar: {
    type: String,
    default: null,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
