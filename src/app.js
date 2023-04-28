require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const cors = require('cors')
const favicon = require('express-favicon')
const logger = require('morgan')

// swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/favicon.ico'))

// swagger link
app.get('/', (req, res) => {
    res.send('<h1>Shelf-Share API</h1><a href="/api-docs">Documentation</a>')
})
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

module.exports = app
