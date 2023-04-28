require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const cors = require('cors')
const favicon = require('express-favicon')
const logger = require('morgan')

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/favicon.ico'))

module.exports = app
