const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide valid email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: [8, 'Password must contain a minimum of 8 characters'],
    },
    username: {
        type: String,
        required: [true, 'Please provide username'],
    },
    givenName: {
        type: String,
        required: [true, 'Please provide given name'],
    },
    familyName: {
        type: String,
        required: [true, 'Please provide family name'],
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please provide date of birth'],
    },
    address: {
        type: String,
        required: [true, 'Please provide address'],
    },
    latitude: {
        type: Number,
        min: -90,
        max: 90,
        required: [true],
    },
    longitude: {
        type: Number,
        min: -180,
        max: 180,
        required: [true],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, username: this.username },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    )
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)
