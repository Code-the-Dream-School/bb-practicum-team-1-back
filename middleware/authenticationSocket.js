const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const authMiddleware = (socket, next) => {
    // check auth token in handshake headers
    const authHeader = socket.handshake.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError(
            'Authentication token missing or invalid'
        )
    }
    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        // attach the user to the socket object
        socket.user = { userId: payload.userId, username: payload.username }
        next()
    } catch (error) {
        throw new UnauthenticatedError(
            'Authentication token missing or invalid'
        )
    }
}

module.exports = authMiddleware
