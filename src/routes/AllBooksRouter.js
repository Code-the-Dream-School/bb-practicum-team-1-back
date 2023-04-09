const express = require('express')
const router = express.Router()
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage, limit: { fileSize: 16777216 } })
const authenticateUser = require('../../middleware/authentication')

const {
    getSingleBook,
    getAllBooks,
    getAllBooksUser,
    createBook,
    deleteBook,
    getImage,
    updatebook,
} = require('../controllers/AllBooksController.js')
router.route('/user').get(authenticateUser, getAllBooksUser)
router
    .route('/:id')
    .delete(authenticateUser, deleteBook)
    .post(authenticateUser, updatebook)
router.route('/').post(authenticateUser, upload.single('image'), createBook)
router.route('/image/:id').get(getImage)

router.route('/:id').get(getSingleBook)
router.route('/').get(getAllBooks)
module.exports = router
