require('dotenv').config()
const fs = require('fs')
const colors = require('colors')
const connectDB = require('../db/connect')

// load models
const User = require('../models/User')
const Book = require('../models/Book')

//  connect to MongoDB
connectDB(process.env.MONGO_URI)

// read the json file
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const books = JSON.parse(fs.readFileSync(`${__dirname}/books.json`, 'utf-8'))
// seed data into the DB
const seedData = async () => {
    try {
        await User.create(users)
        await Book.create(books)
        console.log(`Data successfully seed into the database`.green.inverse)
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

seedData()
