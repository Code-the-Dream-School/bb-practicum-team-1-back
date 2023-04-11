const { StatusCodes } = require('http-status-codes')
const { model, STATES } = require('mongoose')
const Book = require('../../models/Book')
const User = require('../../models/User')
const { BadRequestError, NotFoundError } = require('../../errors')
const Message = require('../../models/Message')

//Create message
const createMessage = async (req, res) => {
    const { userId } = req.user
    const { receivedByUser, messageContent } = req.body
    const message = await Message.create({
        postedByUser: userId,
        receivedByUser,
        messageContent,
    })
    res.status(StatusCodes.CREATED).json({ message })
}

// Get message conversation
const getMessageConversation = async (req, res) => {
    const {
        user: { userId },
        params: { messagingPartnerUserId: receivedByUser },
    } = req

    const messages = await Message.find({
        receivedByUser: [userId, receivedByUser],
    }).sort({ createdAt: 1 })

    if (!messages) {
        throw new NotFoundError(
            `No message found with this recipient ${receivedByUser}`
        )
    }
    res.status(StatusCodes.OK).json({ messages })
}

module.exports = {
    createMessage,
    getMessageConversation,
}
