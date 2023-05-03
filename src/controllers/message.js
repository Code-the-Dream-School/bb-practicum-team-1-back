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

    // set up empty obj to accumulate groupedMessages
    const groupedMessages = {}
    // iterate each curr obj in the message array
    for (const curr of messages) {
        //here we are checking whether the userId is recipient or sender, otherUser would be the other one!
        const otherUser =
            userId === curr.postedByUser.toString()
                ? curr.receivedByUser.toString()
                : curr.postedByUser.toString()

        const user = await User.findById(otherUser)
        const username = user.username
        if (otherUser) {
            if (otherUser in groupedMessages) {
                // If other user already exist in messages array, it will push the new message to it.
                groupedMessages[otherUser].messages.push(curr)
            } else {
                // otherwise it will create new object
                groupedMessages[otherUser] = {
                    userId: otherUser,
                    username: username,
                    messages: [curr],
                }
            }
        }
    }

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

    const groupedUsers = {}

    for (const message of messages) {
        const otherUserId =
            userId === message.postedByUser.toString()
                ? message.receivedByUser.toString()
                : message.postedByUser.toString()

        const user = await User.findById(otherUserId)

        if (!groupedUsers[otherUserId]) {
            groupedUsers[otherUserId] = {
                userId: otherUserId,
                username: user.username,
                messages: [],
            }
        } else {
            groupedUsers[otherUserId].messages.push(message)
        }
    }
    const result = Object.values(groupedUsers)
    res.status(StatusCodes.OK).json(result)
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
        const messages = await Message.find({
            $or: [
                { postedByUser: partnerId, receivedByUser: userId },
                { postedByUser: userId, receivedByUser: partnerId },
            ],
        }).sort({ createdAt: 1 })

        const groupedUsers = {}

        for (const message of messages) {
            const otherUserId =
                userId === message.postedByUser.toString()
                    ? message.receivedByUser.toString()
                    : message.postedByUser.toString()

            const user = await User.findById(otherUserId)

            if (!groupedUsers[otherUserId]) {
                groupedUsers[otherUserId] = {
                    userId: otherUserId,
                    username: user.username,
                    messages: [],
                }
            } else {
                groupedUsers[otherUserId].messages.push(message)
            }
        }
        const updatedMessages = Object.values(groupedUsers)
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
        .populate({
            path: 'postedByUser',
            select: 'username -_id',
            model: 'User',
        })
        .populate({
            path: 'receivedByUser',
            select: 'username -_id',
            model: 'User',
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
        const username = partner.replace(/^{ username: '(.*)' }$/, '$1')
        if (activeUsers.includes(partner)) {
            return { username: username, status: 'online' }
        } else {
            return { username: username, status: 'offline' }
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
