require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const cors = require('cors')
const favicon = require('express-favicon')
const logger = require('morgan')

//const mainRouter = require('./routes/mainRouter.js');
const userRouter = require('./routes/user')

//authentication middleware
const authenticateUser = require('../middleware/authentication')

//error handler
const notFoundMiddleware = require('../middleware/not-found')
const errorHandlerMiddleware = require('../middleware/error-handler')

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(express.static('public'))
//app.use(favicon(__dirname + '/public/favicon.ico'));

// routes
//app.use('/api/v1', mainRouter);
app.use('/api/v1', userRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

module.exports = app
