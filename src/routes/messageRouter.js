const express = require('express')
const router = express.Router()
const authenticateUser = require('../../middleware/authentication')
const { createMessage } = require('../controllers/message.js')

router.route('/').post(authenticateUser, createMessage)

module.exports = router
