const baseURL = process.env.IS_LOCAL
    ? 'https://localhost:8000/api/v1'
    : 'https://shelf-share-app.onrender.com/api/v1'

module.exports = { baseURL }
