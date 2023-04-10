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

//Get all messages
const getAllMessages = async (req, res) => {
    const { userId } = req.user
    const messages = await Message.find()

    const groupedMessages = messages.reduce((acc, curr) => {
        const postedByUser = curr.postedByUser
        const receivedByUser = curr.receivedByUser
        const otherUser =
            userId === postedByUser ? receivedByUser : postedByUser

        if (otherUser in acc) {
            acc[otherUser].push(curr)
        } else {
            acc[otherUser] = [curr]
        }

        return acc
    }, {})

    res.status(StatusCodes.OK).json(groupedMessages)
}
module.exports = { createMessage, getAllMessages }
