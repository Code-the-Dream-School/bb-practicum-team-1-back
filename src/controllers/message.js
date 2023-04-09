const { StatusCodes } = require('http-status-codes')
const { model, STATES } = require('mongoose')
const Book = require('../../models/Book')
const User = require('../../models/User')
const { BadRequestError, NotFoundError } = require('../../errors')
const Message = require('../../models/Message')

//Create message
const createMessage = async (req, res) => {
    const { userId } = req.user
    const { recievedByUser, messageContent } = req.body
    const message = await Message.create({
        postedByUser: userId,
        recievedByUser,
        messageContent,
    })
    res.status(StatusCodes.CREATED).json({ message })
}

module.exports = { createMessage }
