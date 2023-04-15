const app = require('./app')
const connectDB = require('../db/connect')
const http = require('http')
const initiateSocket = require('./socket')
const port = process.env.PORT || 8000

const server = http.createServer(app)

// Initialize Socket.io server
const io = initiateSocket(server)

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        server.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        )
    } catch (error) {
        console.log(error)
    }
}

start()
