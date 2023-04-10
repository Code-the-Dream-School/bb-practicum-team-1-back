const express = require('express')
const router = express.Router()
const authenticateUser = require('../../middleware/authentication')
const {
    createMessage,
    getAllMessages,
    getMessageConversation,
} = require('../controllers/message.js')

router.route('/').post(authenticateUser, createMessage)
router
    .route('/:messagingPartnerUserId')
    .get(authenticateUser, getMessageConversation)

module.exports = router
