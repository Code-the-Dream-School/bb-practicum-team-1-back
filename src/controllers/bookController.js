
const { StatusCodes } = require("http-status-codes")
const { model, STATES } = require("mongoose")
const Book = require("../../models/Book")
const User = require("../../models/User")


//get All books
const getAllBooks = async(req, res ) =>{
 
  const books = await Book.find({ owner: req.user.userId}).sort('createdAt')
  const bookMapped = books.map((x) => {
     var y = JSON.parse(JSON.stringify(x))
     if(y.image && y.image.buffer){

      delete y.image;
      y.imageURL = `/api/v1/book/image/${x.id}`
     }
     return y;
  })
   
  res.status(StatusCodes.OK).json({books: bookMapped, count: bookMapped.length})

}


//create book

const createBook = async (req , res ) =>{
    
  const {userId , username} = req.user

  req.body.owner = userId  
  req.body.userName = username ;
    
  if(req.file){
    req.body.image = {buffer: req.file.buffer , contentType: req.file.mimetype}
  }
  const book = await Book.create(req.body)  
  res.status(StatusCodes.CREATED).json({book}) 
    }


//delete book
const deleteBook = async (req , res) =>{
   const {
        user : {userId},  //located in the request which come from auth middleware.
        params: {id:bookId} // comming from params
      }= req

      const book = await Book.findByIdAndRemove({
        _id : bookId,
        owner : userId
      })
      if(!bookId){
        throw new NotFoundError(`No artCollectible available with this id ${bookId}`)
    }
    res.status(StatusCodes.OK).json({book})

}

//update book info



//get image
const getImage = async (req , res) =>{
    const book = await Book.findById(req.params.id)
    res.set("content-Type" , book.image.contentType)
    res.status(StatusCodes.OK).send(book.image.buffer)
}  


module.exports = { createBook, getImage, getAllBooks , deleteBook}
