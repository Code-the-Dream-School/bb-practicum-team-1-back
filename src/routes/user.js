const express = require('express')
const router = express.Router()

const {signUp, authentication} = require('../controllers/user')

router.post('/sign-up', signUp)
router.post('/authentication', authentication)

module.exports = router