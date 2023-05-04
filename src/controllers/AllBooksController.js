const { StatusCodes } = require('http-status-codes')
const { model, STATES } = require('mongoose')
const Book = require('../../models/Book')
const User = require('../../models/User')
const { BadRequestError, NotFoundError } = require('../../errors')
const findBooksWithinRadius = require('../../middleware/findBooksWithinRadius')
const { baseURL } = require('../util/constants')

// get books by userId

const getBooksUserId = async (req, res) => {
    const {
        params: { userId: userId },
    } = req

    const books = await Book.find({
        owner: userId,
    }).populate('owner', 'username')
    if (!books) {
        throw new NotFoundError(`No books found with this user id ${userId}`)
    }
    const bookMapped = books.map((x) => {
        var y = JSON.parse(JSON.stringify(x))
        if (y.image && y.image.buffer) {
            delete y.image
            y.imageLink = `${baseURL}/books/image/${x.id}`
        }
        return y
    })

    res.status(StatusCodes.OK).json({
        books: bookMapped,
        count: bookMapped.length,
    })
}

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
    y.imageLink = `${baseURL}/books/image/${bookId}`
    res.status(StatusCodes.OK).json(y)
}

//get All Books for all user

const getAllBooks = async (req, res) => {
    const {
        titles,
        authors,
        genres,
        sort,
        fields,
        searchRadius,
        latitude,
        longitude,
    } = req.query
    const queryObject = {}

    if (titles) {
        const titleList = titles
            .split(' ')
            .map((title) => new RegExp(title, 'i'))

        queryObject.title = { $in: titleList }
    }
    if (authors) {
        const authorList = authors
            .split(' ')
            .map((author) => new RegExp(author, 'i'))
        queryObject.author = { $in: authorList }
    }

    if (genres) {
        const genreList = genres
            .split(' ')
            .map((genre) => new RegExp(genre, 'i'))
        queryObject.genre = { $in: genreList }
    }

    let result = Book.find(queryObject).populate(
        'owner',
        'username latitude longitude'
    )

    if (sort) {
        //sorting our response based on user selection.
        const sortList = sort.split(',').join(' ') //splitting sort options as an array and join them together!
        result = result.sort(`${-sortList}`)
    } else {
        result = result.sort('-createdAt')
    }

    if (fields) {
        //showing our response based on user selected fields.
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }
    const page = Number(req.query.page) || 1 //user can enter page number and the default value would be 1.
    const limit = Number(req.query.limit) || 10 //user can limit number of items and the default is 10.
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)
    const books = await result

    if (longitude && latitude && searchRadius) {
        const booksWithinRadius = findBooksWithinRadius(
            //here I called the function to show me all those books less or equal to search radius!
            books,
            latitude,
            longitude,
            searchRadius
        )
        bookMapped = booksWithinRadius.map((x) => {
            var y = JSON.parse(JSON.stringify(x))
            if (y.image && y.image.buffer) {
                delete y.image
                y.imageLink = `${baseURL}/books/image/${x.id}`
            }
            return y
        })
    } else {
        bookMapped = books.map((x) => {
            var y = JSON.parse(JSON.stringify(x))
            if (y.image && y.image.buffer) {
                delete y.image
                y.imageLink = `${baseURL}/books/image/${x.id}`
            }
            return y
        })
    }

    res.status(StatusCodes.OK).json({
        books: bookMapped,
        count: bookMapped.length,
    })
}

//get All books user(owner)
const getAllBooksUser = async (req, res) => {
    const books = await Book.find({ owner: req.user.userId }).populate(
        'owner',
        'username'
    )
    const bookMapped = books.map((x) => {
        var y = JSON.parse(JSON.stringify(x))
        if (y.image && y.image.buffer) {
            delete y.image
            y.imageLink = `${baseURL}/books/image/${x.id}`
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

    let book = await Book.create(req.body)

    var y = JSON.parse(JSON.stringify(book))
    if (y.image && y.image.buffer) {
        delete y.image
        y.imageLink = `${baseURL}/books/image/${book.id}`
    }
    res.status(StatusCodes.CREATED).json({ username: username, book: y })
}

//delete book
const deleteBook = async (req, res) => {
    const {
        user: { userId },
        params: { id: bookId },
    } = req

    const book = await Book.findOne({
        _id: bookId,
    })

    if (!book) {
        throw new NotFoundError(`No book available with this id ${bookId}`)
    }

    const owner = book.owner.toString() // because owner is stored as an objectId I need to convert it to string to compare it with Object Id

    if (owner !== userId) {
        throw new BadRequestError('you should be the owner')
    }

    await book.deleteOne({})

    res.status(StatusCodes.OK).json({ msg: 'Book successfully deleted.' })
}

//update book info

const updatebook = async (req, res) => {
    const {
        //body :{title , price},
        user: { userId },
        params: { id: bookId },
    } = req

    let updateFields = { ...req.body } // create updateFields obj that will include all fields that need to be updated
    if (req.file) {
        updateFields.image = {
            buffer: req.file.buffer,
            contentType: req.file.mimetype,
        }
    }
    const book = await Book.findOneAndUpdate(
        { _id: bookId, owner: userId },
        updateFields, //the part which gonna be upadated
        { new: true, runValidators: true }
    )
    const owner = book.owner.toString()

    if (!bookId) {
        throw new NotFoundError(`No book available with this id ${bookId}`)
    }
    if (userId !== owner) {
        throw new BadRequestError('you should be the owner')
    }

    var y = JSON.parse(JSON.stringify(book))
    if (y.image && y.image.buffer) {
        delete y.image
        y.imageLink = `${baseURL}/books/image/${book.id}`
    }
    res.status(StatusCodes.OK).json({ book: y })
}

//getImage
const getImage = async (req, res) => {
    const book = await Book.findById(req.params.id)
    if (!book || !book.image) {
        console.log('Error: Image not found')
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: 'Image not found' })
    }
    res.set('content-Type', book.image.contentType)
    res.status(StatusCodes.OK).send(book.image.buffer)
}

module.exports = {
    getBooksUserId,
    getSingleBook,
    getImage,
    getAllBooks,
    createBook,
    getAllBooksUser,
    deleteBook,
    updatebook,
}
