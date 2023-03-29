require('dotenv').config()
const User = require('../../models/User')
const fetch = require('node-fetch')
const { StatusCodes } = require('http-status-codes')

const getAddressCoordinate = async (req, res) => {
    const address = req.query.address
    const API_KEY = process.env.API_KEY
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${API_KEY}`

    try {
        const result = await fetch(url)
        const data = await result.json()
        res.status(StatusCodes.OK).json(data)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message)
    }
}

const getAddressAutocomplete = async (req, res) => {
    const address = req.query.address
    const API_KEY = process.env.API_KEY
    const url = `"https://api.geoapify.com/v1/geocode/autocomplete?text=${address}&apiKey=${API_KEY}`

    try {
        const result = await fetch(url)
        const data = await result.json()
        res.status(StatusCodes.OK).json(data)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message)
    }
}
module.exports = { getAddressCoordinate, getAddressAutocomplete }
