require('dotenv').config()
const fetch = require('node-fetch')
const { StatusCodes } = require('http-status-codes')

const getAddressCoordinate = async (req, res) => {
    const address = req.query.address
    const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${GEOAPIFY_API_KEY}`

    try {
        const result = await fetch(url)
        const data = await result.json()
        const mappedData = data.features.map((x) => {
            const container = {}
            container.address = x.properties.formatted
            container.latitude = x.properties.lat
            container.longitude = x.properties.lon
            return container
        })
        res.status(StatusCodes.OK).json(mappedData[0])
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message)
    }
}

const getAddressAutocomplete = async (req, res) => {
    const address = req.query.address
    const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${address}&apiKey=${GEOAPIFY_API_KEY}`

    try {
        const result = await fetch(url)
        const data = await result.json()
        const mappedData = data.features.map((x) => {
            const container = {}
            container.address = x.properties.formatted
            container.latitude = x.properties.lat
            container.longitude = x.properties.lon
            return container
        })
        res.status(StatusCodes.OK).json(mappedData)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message)
    }
}
module.exports = { getAddressCoordinate, getAddressAutocomplete }
