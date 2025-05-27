const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  receiver: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },

  content: {
    text: { type: String, default: null },
    image: { type: String, default: null }, // e.g. Cloudinary URL
  },

  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'mixed'],
    default: 'text',
  },

  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: String,
    }
  ],

  isDeleted: {
    type: Boolean,
    default: false,
  },

  deletedFor: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],

  readBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
