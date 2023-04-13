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

// Mark conversation as read
const markConversationAsRead = async (req, res) => {
    try {
        const { userId } = req.user
        const { partnerId } = req.body
        // update multiple message at the same time
        await Message.updateMany(
            {
                postedByUser: partnerId,
                receivedByUser: userId,
            },
            {
                messageRead: true,
            },
            { new: true, runValidators: true }
        )
        // returning all updated message with new messageRead status
        const updatedMessages = await Message.find({
            $or: [
                { postedByUser: partnerId, receivedByUser: userId },
                { postedByUser: userId, receivedByUser: partnerId },
            ],
        }).sort({ createdAt: 1 })

        return res.status(StatusCodes.OK).json({ updatedMessages })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message)
    }
    console.log(updatedMessages)
}

module.exports = {
    createMessage,
    markConversationAsRead,
}
