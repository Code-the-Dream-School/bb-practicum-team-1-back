const app = require('./app')
const connectDB = require('../db/connect')
const http = require('http')
const initiateSocket = require('./socket')
const userRouter = require('./routes/user')
const mainRouter = require('./routes/mainRouter.js')
const allBooksRouter = require('./routes/allBooksRouter.js')
const addressRouter = require('./routes/userAddress')
const messageRouter = require('./routes/messageRouter')
//error handler
const notFoundMiddleware = require('../middleware/not-found')
const errorHandlerMiddleware = require('../middleware/error-handler')

const port = process.env.PORT || 8000
const server = http.createServer(app)
const { io, getActiveUsers } = initiateSocket(server)

app.use((req, res, next) => {
    req.io = io
    req.getActiveUsers = getActiveUsers
    return next()
})

app.use('/api/v1/user', userRouter)
app.use('/api/v1', mainRouter)
app.use('/api/v1/books', allBooksRouter)
app.use('/api/v1/address', addressRouter)
app.use('/api/v1/messages', messageRouter)
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// Initialize Socket.io server
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
