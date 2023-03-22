const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limit: { fileSize: 16777216 } });
const authenticateUser = require("../../middleware/authentication");

const {
  getSingleBook,
  getAllBooks,
  getAllBooksUser,
  createBook,
  deleteBook,
  getImage,
} = require("../controllers/allBooksController.js");
router.route("/user").get(authenticateUser, getAllBooksUser);
router.route("/:id").get(getSingleBook).delete(authenticateUser, deleteBook);
router
  .route("/")
  .get(getAllBooks)
  .post(authenticateUser, upload.single("image"), createBook);
router.route("/image/:id").get(getImage);

module.exports = router;

