const express = require('express')
const router = express.Router()
const authenticateUser = require('../../middleware/authentication')
const {
    createMessage,
    getAllMessages,
    markConversationAsRead,
} = require('../controllers/message.js')

router.route('/').post(authenticateUser, createMessage)
router.route('/').patch(authenticateUser, markConversationAsRead)

module.exports = router
