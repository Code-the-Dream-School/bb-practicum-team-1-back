const baseURL = process.env.IS_LOCAL
    ? 'http://localhost:8000/api/v1'
    : 'https://shelf-share.onrender.com/api/v1'

module.exports = { baseURL }
