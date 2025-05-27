const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "name should be under 30 chars"],
        minLength: [1, "name should have more than 4 chars"]
    },
    lastName: {
        type: String,
        maxLength: [30, "name should be under 30 chars"],
        minLength: [1, "name should have more than 4 chars"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter a valid Email"]
    },
    avatar:{
        public_id:String,
        url:String
    },
    password: {
        type: String,
        minLength: [8, 'password should have atleast 8 chars'],
        select: false, // whenever we use find method or try to get the information select fale will not display it
        required: function () {
            return !this.googleId && !this.appleId;
            }
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    googleId: {
        type: String,
        unique: true,
        select : false,
        sparse: true // only index non-null values
    },
    appleId: {
        type: String,
        unique: true,
        select : false,
        sparse: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    userLastMessage: {
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
        }
}, { timestamps: true });

//hashing the passwords 
userSchema.pre("save", async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// jwt token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

// compare password 
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// generating password reset token 
userSchema.methods.getResetPasswordToken = function () {
    // generating a token 
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and adding to userschema 
    this.resetPasswordToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;


}

module.exports = mongoose.model("User", userSchema);