const express = require('express')
const router = express.Router()
const authenticateUser = require('../../middleware/authentication')
const {
    createMessage,
    getAllMessages,
    getMessageConversation,
    markConversationAsRead,
} = require('../controllers/message.js')

router
    .route('/')
    .post(authenticateUser, createMessage)
    .get(authenticateUser, getAllMessages)

router
    .route('/:messagingPartnerUserId')
    .get(authenticateUser, getMessageConversation)
    
 router
      .route('/').patch(authenticateUser, markConversationAsRead)

module.exports = router
