require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const cors = require('cors')
const favicon = require('express-favicon')
const logger = require('morgan')

//authentication middleware
const authenticateUser = require('../middleware/authentication')

//error handler
const notFoundMiddleware = require('../middleware/not-found')
const errorHandlerMiddleware = require('../middleware/error-handler')

// calling db connection
const userRouter = require('./routes/user')
const mainRouter = require('./routes/mainRouter.js')
const allBooksRouter = require('./routes/allBooksRouter.js')
const addressRouter = require('./routes/userAddress')
const messageRouter = require('./routes/messageRouter')
// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/favicon.ico'))

// routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1', mainRouter)
app.use('/api/v1/books', allBooksRouter)
app.use('/api/v1/address', addressRouter)
app.use('/api/v1/messages', messageRouter)
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

module.exports = app
