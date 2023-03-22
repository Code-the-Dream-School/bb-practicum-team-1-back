const User = require('../../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../../errors')

const signUp = async (req, res) => {
    const user = await User.create({ ...req.body })
    res.status(StatusCodes.CREATED).json({
        user: {
            email: user.email,
            username: user.username,
            givenName: user.givenName,
            familyName: user.familyName,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            latitude: user.latitude,
            longitude: user.longitude,
        },
    })
}

const authentication = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new BadRequestError('Please provide a valid email and password.')
    }
    const user = await User.findOne({ email })

    if (!user) {
        throw new UnauthenticatedError('Credentials are invalid')
    }

    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({
        user: {
            email: user.email,
            username: user.username,
            givenName: user.givenName,
            familyName: user.familyName,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            latitude: user.latitude,
            longitude: user.longitude,
        },
    })
}

module.exports = {
    signUp,
    authentication,
}
