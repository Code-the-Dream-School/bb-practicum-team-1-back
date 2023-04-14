const { StatusCodes } = require('http-status-codes')
const { model, STATES } = require('mongoose')
const Book = require('../../models/Book')
const User = require('../../models/User')
const { BadRequestError, NotFoundError } = require('../../errors')
const Message = require('../../models/Message')

// Create message
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

// Get all messages
const getAllMessages = async (req, res) => {
    const { userId } = req.user
    const messages = await Message.find({
        $or: [{ postedByUser: userId }, { receivedByUser: userId }], //We find all those messages which our userId sent or received. .
    }).sort({ createdAt: 1 })

    const groupedMessages = messages.reduce((acc, curr) => {
        //here we are checking whether the userId is recipient or sender, otherUser would be the other one!
        const otherUser =
            userId === curr.postedByUser.toString()
                ? curr.receivedByUser.toString()
                : curr.postedByUser.toString()

        if (otherUser) {
            if (otherUser in acc) {
                //If other user already exist in messages array, it will push the new message to it.
                acc[otherUser].push(curr)
            } else {
                //otherwise it will create new array of messages!
                acc[otherUser] = [curr]
            }
        }
        return acc
    }, {}) //this {}  is the initial value of the accumulator here, which is null.

    res.status(StatusCodes.OK).json(groupedMessages)
}

// Get message conversation
const getMessageConversation = async (req, res) => {
    const {
        user: { userId },
        params: { messagingPartnerUserId: partnerId },
    } = req

    const messages = await Message.find({
        $or: [
            { postedByUser: partnerId, receivedByUser: userId },
            { postedByUser: userId, receivedByUser: partnerId },
        ],
    }).sort({ createdAt: 1 })

    res.status(StatusCodes.OK).json({ messages })
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
}

// Delete single message
const deleteMessage = async (req, res) => {
    const {
        user: { userId },
        params: { deleteMessageId: messageId },
    } = req

    const message = await Message.findByIdAndDelete({
        _id: messageId,
        receivedByUser: userId,
    })

    if (!message) {
        throw new NotFoundError(`No message found with this Id ${messageId}`)
    }
    res.status(StatusCodes.OK).json({
        msg: `This message with Id: ${messageId} was successfully deleted.`,
    })
}

module.exports = {
    createMessage,
    getAllMessages,
    getMessageConversation,
    markConversationAsRead,
    deleteMessage,
}
