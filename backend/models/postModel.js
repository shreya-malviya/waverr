const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true
        },
        location:{
            type:String,
            maxlength: [50, 'location too long']
        },
        caption: {
            type: String,
            maxlength: [100, 'Caption too long']
        },
        media: [
            {
                url: { type: String, required: true },
                type: { type: String, enum: ['image', 'video'], required: true, default:'image' }
            }
        ],
        commentsEnabled: { type: Boolean, default: true },
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                message: {
                    type: String,
                    minlength: [1, "Comment can't be empty"],
                    maxlength: [100, 'Comment too long']
                },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        visibility: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Post', postSchema)
