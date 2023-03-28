require('dotenv').config()
const colors = require('colors')
const connectDB = require('../db/connect')

// load models
const User = require('../models/User')
const Book = require('../models/Book')
//  connect to MongoDB
connectDB(process.env.MONGO_URI)

// delete data in the DB
const deleteData = async () => {
    try {
        await User.deleteMany({})
        await Book.deleteMany({})
        console.log(`Data successfully deleted`.red.inverse)
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

deleteData()
