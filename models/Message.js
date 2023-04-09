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

        recievedByUser: {
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
    const recievedByUser = await mongoose
        .model('User')
        .findById(this.recievedByUser)

    if (!postedByUser || !recievedByUser) {
        throw new NotFoundError('User not found!')
    }
    next()
})

module.exports = mongoose.model('Message', MessageSchema)
