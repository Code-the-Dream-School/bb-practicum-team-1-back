const socketio = require('socket.io')
const authMiddleware = require('./../middleware/authenticationSocket')
const { listPartnerUsers, userTypingStatus } = require('./controllers/message')

const originURL =
    process.env.IS_LOCAL === 'TRUE'
        ? 'http://localhost:3000'
        : 'https://shelf-share-app.onrender.com'

const initiateSocket = (server) => {
    const io = socketio(server, {
        cors: { origin: originURL, methods: ['GET', 'POST'] },
    })

    //this is the authentication middleware we created for Socket.io
    io.use(authMiddleware)

    const activeUsers = {}

    io.on('connection', async (socket) => {
        //event listener for when a new client connects to the server using a WebSocket.
        console.log('New client connected!')

        //checks for the username when a client connect!
        const { userId } = socket.user
        activeUsers[userId] = socket // Add the user to the activeUsers object

        // Get the list of partner users for the authenticated user.
        const partnerUsers = await listPartnerUsers(
            userId,
            Object.keys(activeUsers)
        )
        // Emit the list of partner users to the connected client.
        socket.emit('partnerUsers', partnerUsers)

        // Listen for typing event
        socket.on('typing', (data) => {
            userTypingStatus(socket, data)
        })

        socket.on('disconnect', () => {
            console.log('User disconnected!')
            delete activeUsers[userId] // Remove the user from the activeUsers object
        })
    })

    const getActiveUsers = () => {
        return activeUsers
    }

    return { io, getActiveUsers }
}

module.exports = initiateSocket
