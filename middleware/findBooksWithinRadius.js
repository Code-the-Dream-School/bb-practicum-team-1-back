const Book = require('../models/Book')
const User = require('../models/User')
const geodist = require('geodist')

//Caculate the distance bitween two lan and lon

const findBooksWithinRadius = (books, latitude, longitude, searchRadius) => {
    return books.filter((book) => {
        const distance = geodist(
            { lat: latitude, lon: longitude },
            { lat: book.owner.latitude, lon: book.owner.longitude }
        )
        return distance <= searchRadius
    })
}

module.exports = findBooksWithinRadius
