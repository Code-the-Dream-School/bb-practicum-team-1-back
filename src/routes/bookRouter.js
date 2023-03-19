const express = require('express');
const router = express.Router();
const {creatBook} = require('../controllers/bookController.js');

router.route('/').post(creatBook)
  
module.exports = router;