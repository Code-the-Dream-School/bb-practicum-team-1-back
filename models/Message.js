const mongoose = require('mongoose')
const User = require('./User')
const { NotFoundError } = require('../errors')

const MessageSchema = new mongoose.Schema(
    {
        postedByUser: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true],
        },

        receivedByUser: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true],
        },

        messageContent: {
            type: String,
            required: true,
        },

        messageRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: Date.now(),
        },
    },
    { timestamps: true }
)

//Check the user if exist!
MessageSchema.pre('save', async function (next) {
    const postedByUser = await mongoose
        .model('User')
        .findById(this.postedByUser)
    const receivedByUser = await mongoose
        .model('User')
        .findById(this.receivedByUser)

    if (!postedByUser || !receivedByUser) {
        throw new NotFoundError('User not found!')
    }
    next()
})

module.exports = mongoose.model('Message', MessageSchema)
