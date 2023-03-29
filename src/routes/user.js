const express = require('express')
const router = express.Router()

const { signUp, authentication } = require('../controllers/user')
const {
    getAddressCoordinate,
    getAddressAutocomplete,
} = require('../controllers/userAddress')

router.post('/sign-up', signUp)
router.post('/authentication', authentication)
router.get('/address', getAddressCoordinate)
router.get('/address', getAddressAutocomplete)

module.exports = router
