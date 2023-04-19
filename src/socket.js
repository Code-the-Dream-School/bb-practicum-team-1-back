const socketio = require('socket.io')
const authMiddleware = require('./../middleware/authenticationSocket')
const { listPartnerUsers } = require('./controllers/message')
const initiateSocket = (server) => {
    const io = socketio(server) //This line creates a new instance of socket.io and passes in the server parameter, allowing it to listen for WebSocket connections on the same port as the HTTP server.

    //this is the authentication middleware we created for Socket.io
    io.use(authMiddleware)
    const activeUsers = []

    io.on('connection', async (socket) => {
        //event listener for when a new client connects to the server using a WebSocket.
        console.log('New client connected!')

        //ckecks for the username when a client connect!
        const { userId } = socket.user
        activeUsers.push(userId) // Add the user to the activeUsers array
        // Get the list of partner users for the authenticated user.
        const partnerUsers = await listPartnerUsers(userId, activeUsers)

        // Emit the list of partner users to the connected client.
        socket.emit('partnerUsers', partnerUsers)

        socket.on('disconnect', () => {
            //event listener for when a client disconnects from the server.
            console.log('User disconnected!')
            const index = activeUsers.indexOf(socket.username)
            if (index !== -1) {
                activeUsers.splice(index, 1) //remove the username from the activeUser array.
            }
        })
    })

    const getActiveUsers = () => {
        return activeUsers
    }

    return { io, getActiveUsers }
}

module.exports = initiateSocket
