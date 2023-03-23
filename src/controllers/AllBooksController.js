const { StatusCodes } = require('http-status-codes')
const { model, STATES } = require('mongoose')
const Book = require('../../models/Book')
const User = require('../../models/User')
const { BadRequestError, NotFoundError } = require('../../errors')

//get single book

const getSingleBook = async (req, res) => {
    const {
        params: { id: bookId },
    } = req

    const book = await Book.findOne({
        _id: bookId,
    }).populate('owner', 'username')
    if (!book) {
        throw new NotFoundError(`No book available with this id ${bookId}`)
    }
    var y = JSON.parse(JSON.stringify(book))
    y.imageURL = `/api/v1/book/image/${bookId}`
    res.status(StatusCodes.OK).json(y)
}

//get All Books for each user

const getAllBooks = async (req, res) => {
    const { title, author, sort, fields } = req.query
    const queryObject = {} //instead of putting this into find we can create a new object for that.

    if (title) {
        queryObject.title = title
    }
    if (author) {
        queryObject.author = author
    }
    let result = Book.find(queryObject).populate('owner', 'username')
    if (sort) {
        //sorting our response based on user slection.
        const sortList = sort.split(',').join(' ') //splitting sort options as an array and join them together!
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt')
    }

    if (fields) {
        //showing our responce based on user selected fields.
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }

    const page = Number(req.query.page) || 1 //user can enter page number and the default value would be 1.
    const limit = Number(req.query.limit) || 10 //user can limit number of items and the default is 10.
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)
    const books = await result

    const bookMapped = books.map((x) => {
        var y = JSON.parse(JSON.stringify(x))
        if (y.image && y.image.buffer) {
            delete y.image
            y.imageURL = `/api/v1/books/image/${x.id}`
        }
        return y
    })
    res.status(StatusCodes.OK).json({
        books: bookMapped,
        count: bookMapped.length,
    })
}

//get All books all users
const getAllBooksUser = async (req, res) => {
    const books = await Book.find({ owner: req.user.userId }).populate(
        'owner',
        'username'
    )
    const bookMapped = books.map((x) => {
        var y = JSON.parse(JSON.stringify(x))
        if (y.image && y.image.buffer) {
            delete y.image
            y.imageURL = `/api/v1/book/image/${x.id}`
        }
        return y
    })

    res.status(StatusCodes.OK).json({
        books: bookMapped,
        count: bookMapped.length,
    })
}

//create book

const createBook = async (req, res) => {
    const { userId, username } = req.user

    req.body.owner = userId

    if (req.file) {
        req.body.image = {
            buffer: req.file.buffer,
            contentType: req.file.mimetype,
        }
    }
    const book = await Book.create(req.body)
    res.status(StatusCodes.CREATED).json({ username: username, book })
}

//delete book
const deleteBook = async (req, res) => {
    const {
        user: { userId }, //located in the request which come from auth middleware.
        params: { id: bookId }, // comming from params
    } = req

    const book = await Book.findByIdAndRemove({
        _id: bookId,
        owner: userId,
    })
    if (!bookId) {
        throw new NotFoundError(`No bookId available with this id ${bookId}`)
    }
    res.status(StatusCodes.OK).json({ book })
}

//update book info

const updatebook = async (req, res) => {
    const {
        //body :{title , price},
        user: { userId },
        params: { id: bookId },
    } = req

    if (req.file) {
        req.body.image = {
            buffer: req.file.buffer,
            contentType: req.file.mimetype,
        }
    }

    const book = await Book.findByIdAndUpdate(
        { _id: bookId, owner: userId },
        req.body, //the part which gonna be upadated
        { new: true, runValidators: true }
    )
    if (!bookId) {
        throw new NotFoundError(`No book available with this id ${bookId}`)
    }

    res.status(StatusCodes.OK).json({ book })
}

//getImage
const getImage = async (req, res) => {
    const book = await Book.findById(req.params.id)
    res.set('content-Type', book.image.contentType)
    res.status(StatusCodes.OK).send(book.image.buffer)
}

module.exports = {
    getSingleBook,
    getImage,
    getAllBooks,
    createBook,
    getAllBooksUser,
    deleteBook,
    updatebook,
}
