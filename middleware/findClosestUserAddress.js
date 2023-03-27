const Book = require('../models/Book')
const User = require('../models/User')
const geodist = require('geodist')

//Caculate the distance bitween two lan and lon
const findClosestUserAddress = async (
    latitude,
    longitude,
    searchRadius = null //defualt value is null
) => {
    const users = await User.find({})
    const distances = users.map((user) => {
        //find the distances
        const dist = geodist(
            { lat: user.latitude, lon: user.longitude },
            { lat: latitude, lon: longitude },
            { unit: 'mi' }
        )
        return { user, distance: dist }
    })

    if (searchRadius !== null) {
        const filteredDistances = distances.filter(
            (d) => d.distance <= searchRadius
        )
        filteredDistances.sort((a, b) => a.distance - b.distance)

        if (filteredDistances.length > 0) {
            const filteredDistances = distances.filter(
                (d) => d.distance <= searchRadius
            )
            filteredDistances.sort((a, b) => a.distance - b.distance)
            const usersWithinRadius = filteredDistances.map((d) => d.user)
            console.log('users', usersWithinRadius)
            const books = await Book.find({ owner: { $in: usersWithinRadius } })
            const count = await Book.countDocuments({
                owner: usersWithinRadius,
            })
            console.log('count', count)
            return books
        }
    } else {
        distances.sort((a, b) => a.distance - b.distance)
        const closestUser = distances[0].user
        const books = await Book.find({ owner: closestUser._id })
        return { user: books }
    }
    return null
}

module.exports = findClosestUserAddress
