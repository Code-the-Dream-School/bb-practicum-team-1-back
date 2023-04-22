const socketio = require('socket.io')
const authMiddleware = require('./../middleware/authenticationSocket')
const {
    listPartnerUsers,
    userTypingStatus,
    createMessage,
} = require('./controllers/message')
const { default: mongoose } = require('mongoose')

const initiateSocket = (server) => {
    const io = socketio(server)

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

        //Hundling message creation
        socket.on('createMessage', async (data) => {
            const { to, messageContent } = data

            //returning Id as an objectId
            const ObjectId = mongoose.Types.ObjectId

            // finding socket.id based on userId
            const recipientSocket = Object.values(activeUsers).find(
                (userSocket) => userSocket.user.userId === to
            )
            //creating the message
            if (recipientSocket) {
                const messageToCreate = await createMessage(
                    socket,
                    activeUsers,
                    {
                        receivedByUser: new ObjectId(to),
                        messageContent,
                    }
                )

                recipientSocket.emit('newMessage', messageToCreate)
            } else {
                console.log(`User ${to} is not connected`)
            }
        })
        socket.on('disconnect', () => {
            console.log('User disconnected!')
            delete activeUsers[userId] // Remove the user from the activeUsers object
        })
    })

    const getActiveUsers = () => {
        return Object.keys(activeUsers)
    }

    return { io, getActiveUsers }
}

module.exports = initiateSocket
