const { StatusCodes } = require('http-status-codes')
const { model, STATES } = require('mongoose')
const Book = require('../../models/Book')
const User = require('../../models/User')
const { BadRequestError, NotFoundError } = require('../../errors')
const Message = require('../../models/Message')

const createMessage = async (req, res) => {
    const { userId } = req.user
    const { receivedByUser, messageContent } = req.body
    const message = await Message.create({
        postedByUser: userId,
        receivedByUser,
        messageContent,
    })

    const activeUsers = req.getActiveUsers()
    const recipientSocketId = activeUsers[receivedByUser]?.id

    if (recipientSocketId) {
        //ensure that message is sent to user with specific userId
        req.io.to(recipientSocketId).emit('newMessage', { message })
    }
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

    const message = await Message.findOneAndDelete({
        _id: messageId,
        postedByUser: userId,
    })

    if (!message) {
        throw new NotFoundError(
            `Not authorize to delete this message with messageId: ${messageId}`
        )
    }
    res.status(StatusCodes.OK).json({
        msg: `This message with Id: ${messageId} was successfully deleted.`,
    })
}

//getAllPartnerUsers

const listPartnerUsers = async (userId, activeUsers) => {
    const messages = await Message.find({
        $or: [{ postedByUser: userId }, { receivedByUser: userId }],
    })

    const messagePartners = new Set() //here we are creating a new Set() which the same as array but without duplicate value.
    messages.map((x) => {
        const postedByUser = x.postedByUser
        const receivedByUser = x.receivedByUser
        const otherUser =
            userId === postedByUser.toString()
                ? receivedByUser.toString()
                : postedByUser.toString()

        messagePartners.add(otherUser)
    })

    const partnersArray = Array.from(messagePartners) // convert Set() to array again!

    const partnersWithStatus = partnersArray.map((partner) => {
        if (activeUsers.includes(partner)) {
            return { userId: partner, status: 'online' }
        } else {
            return { userId: partner, status: 'offline' }
        }
    })
    return partnersWithStatus
}

// Get User Typing Status
const userTypingStatus = async (socket, data) => {
    const { typing } = data
    const { userId, username } = socket.user

    if (typing) {
        // when a user starts typing, server broadcasts a 'typing' event to all connected partners
        socket.broadcast.emit('typing', {
            username: username,
            message: 'is typing...',
        })
    } else {
        // when a user stops typing, server broadcasts a 'typing' event with an empty message to all connected partners
        socket.broadcast.emit('typing', {
            username: username,
            message: '',
        })
    }
}
module.exports = {
    createMessage,
    getAllMessages,
    getMessageConversation,
    markConversationAsRead,
    deleteMessage,
    listPartnerUsers,
    userTypingStatus,
}
