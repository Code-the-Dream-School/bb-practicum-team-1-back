const express = require('express')
const router = express.Router()

const {
    getAddressCoordinate,
    getAddressAutocomplete,
} = require('../controllers/userAddress')

router.get('/search', getAddressCoordinate)
router.get('/autocomplete', getAddressAutocomplete)

module.exports = router
