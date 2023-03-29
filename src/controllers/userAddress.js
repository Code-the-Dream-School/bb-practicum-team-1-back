require('dotenv').config()
const User = require('../../models/User')
const fetch = require('node-fetch')
const { StatusCodes } = require('http-status-codes')

const getAddressCoordinate = async (req, res) => {
    const address = req.query.address
    const API_KEY = process.env.API_KEY
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${API_KEY}`
    // const listAddress = await User.find({ address })
    // res.status(StatusCodes.OK).json(listAddress)
    try {
        const result = await fetch(url)
        const data = await result.json()
        console.log(data)
    } catch (err) {
        console.log(err)
    }
}

const getAddressAutocomplete = async (reqq, res) => {
    const address = req.query.address
    const API_KEY = process.env.API_KEY
    const url = `"https://api.geoapify.com/v1/geocode/autocomplete?text=${address}&apiKey=${API_KEY}`

    try {
        const result = await fetch(url)
        const data = await result.json()
        console.log(data)
    } catch (err) {
        console.log(err)
    }
}
module.exports = { getAddressCoordinate, getAddressAutocomplete }
