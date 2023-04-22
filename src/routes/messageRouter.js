const express = require('express')
const router = express.Router()
const authenticateUser = require('../../middleware/authentication')
const {
    createMessageHTTP,
    getAllMessages,
    getMessageConversation,
    markConversationAsRead,
    deleteMessage,
    listPartnerUsers,
} = require('../controllers/message.js')

router
    .route('/')
    .post(authenticateUser, createMessageHTTP)
    .get(authenticateUser, getAllMessages)

router
    .route('/:messagingPartnerUserId')
    .get(authenticateUser, getMessageConversation)

router.route('/').patch(authenticateUser, markConversationAsRead)
router.route('/:deleteMessageId').delete(authenticateUser, deleteMessage)

module.exports = router
