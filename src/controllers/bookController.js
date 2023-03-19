


//get All books

const { model } = require("mongoose")
const Book = require("../models/Book")




//get single book


//create book

const creatBook = async (req , res ) =>{

    const book = await Book.create(req.body)  // 1.creating the artCollectible and push it into req.body
    res.status(200).json({book})

}

//update book info

//delete book

//get image


module.exports = { creatBook}
