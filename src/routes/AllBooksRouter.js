const express = require('express');
const router = express.Router();
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limit:{fileSize: 16777216}});

const {getSingleBook , getImage , getAllBooks} =  require('../controllers/AllBooksController.js');


router.route('/:id').get(getSingleBook)
router.route('/').get(getAllBooks)
router.route('/image/:id').get(getImage)


module.exports = router;