require('dotenv').config()
const fetch = require('node-fetch')

const addressToCoordinate = async (address) => {
    const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${GEOAPIFY_API_KEY}`

    const result = await fetch(url)
    const data = await result.json()
    const mappedData = data.features.map((x) => {
        const container = {}
        container.address = x.properties.formatted
        container.latitude = x.properties.lat
        container.longitude = x.properties.lon
        return container
    })
    return mappedData[0]
}

module.exports = addressToCoordinate
