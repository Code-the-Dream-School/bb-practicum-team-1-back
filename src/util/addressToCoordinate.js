require('dotenv').config()
const fetch = require('node-fetch')
const defaultLatitude = 37.505305
const defaultLongitude = -77.50425
const defaultAddress =
    '5816 Midlothian Tpke, Richmond, VA  23225, United States'

const addressToCoordinate = async (address) => {
    const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${GEOAPIFY_API_KEY}`

    const result = await fetch(url)
    const data = await result.json()
    if (!data || data.features.length === 0) {
        return {
            latitude: defaultLatitude,
            longitude: defaultLongitude,
            address: defaultAddress,
        }
    }

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
