const express = require('express');
const router = express.Router();
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limit:{fileSize: 16777216}});
const {createBook, getAllBooks, getImage, deleteBook} = require('../controllers/bookController.js');

router.route('/').post(upload.single('image'), createBook)
router.route('/').get(getAllBooks)
router.route('/image/:id').get(getImage)
router.route('/:id').delete(deleteBook)
  
module.exports = router;