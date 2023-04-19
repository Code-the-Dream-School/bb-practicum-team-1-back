const express = require('express')
const router = express.Router()
const authenticateUser = require('../../middleware/authentication')
const {
    createMessage,
    getAllMessages,
    getMessageConversation,
    markConversationAsRead,
    deleteMessage,
    listPartnerUsers,
} = require('../controllers/message.js')

router
    .route('/')
    .post(authenticateUser, createMessage)
    .get(authenticateUser, getAllMessages)

router
    .route('/:messagingPartnerUserId')
    .get(authenticateUser, getMessageConversation)

router.route('/').patch(authenticateUser, markConversationAsRead)
router.route('/:deleteMessageId').delete(authenticateUser, deleteMessage)

module.exports = router
