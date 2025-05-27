const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileName: {
    type: String,
  },
  posts: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
  ],
  friends: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  friendReqStatus: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'removed'],
        default: 'pending'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  blockedUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  // using this as story;
  pictures: [
    {
      url: { type: String, required: false },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  avatars: [
    {
      url: { type: String, required: false },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  bio: {
    type: String,
    maxLength: 160,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  birthday: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  story: {
    type: String,
  },
  statusText: {
    type: String,
    minLength: [1, 'Status must be at least 1 character long.'],
    maxLength: [20, 'Status cannot exceed 20 characters.']
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
