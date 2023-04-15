const socketio = require('socket.io')

const initiateSocket = (server) => {
    const io = socketio(server) //This line creates a new instance of socket.io and passes in the server parameter, allowing it to listen for WebSocket connections on the same port as the HTTP server.

    io.on('connection', (socket) => {
        //event listener for when a new client connects to the server using a WebSocket.
        console.log('New client connected!')

        socket.on('disconnect', () => {
            //event listener for when a client disconnects from the server.
            console.log('User disconnected!')
        })
    })
    return io
}

module.exports = initiateSocket
