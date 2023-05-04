const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const authMiddleware = (socket, next) => {
    // check auth token in handshake headers
    const jwtToken = socket.handshake.query.token

    if (!jwtToken) {
        return next(
            new UnauthenticatedError('Authentication token missing or invalid')
        )
    }
    try {
        const payload = jwt.verify(jwtToken, process.env.JWT_SECRET)
        // attach the user to the socket object
        socket.user = { userId: payload.userId, username: payload.username }
        next()
    } catch (error) {
        next(
            new UnauthenticatedError('Authentication token missing or invalid')
        )
    }
}

module.exports = authMiddleware
