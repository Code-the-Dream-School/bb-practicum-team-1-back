const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema(
    {
        //options which should be considered when sharing a book!

        title: {
            type: String,
            required: [true, 'Please provide title for your book.'],
        },

        language: {
            type: String,
            required: [true, 'Please provide  of your book.'],
        },
        ageRange: {
            type: String,
            required: [true, 'Please specify age range of your book.'],
            enum: ['kids', 'adults'],
            default: 'kids',
        },
        publishingYear: {
            type: Number,
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true],
        },
        status: {
            type: String,
            enum: ['open', 'borrowed'],
            default: 'open',
        },
        // price : {
        //  type : String ,
        //  required : [true , 'Please provide price for your book']

        // } ,
        image: {
            buffer: Buffer,
            contentType: String,
        },
        imageLink: {
            type: String,
        },
        description: {
            //about/preview
            type: String,
            required: true,
        },
        genre: {
            type: String,
            enum: [
                'Fantasy',
                'Science Fiction',
                'Dystopian',
                'Action & Adventure',
                'Romance',
                'Mystery',
                'Horror',
                'Thriller',
                'Paranormal',
                'Western',
                'Literary Fiction',
                'Historical Fiction',
                'Contemporary Fiction',
                'Magic Realism',
                'Graphic Novel',
                'Short Story',
                'Young Adult',
                'New Adult',
                'Biographies',
                'Memoirs & Autobiographies',
                'Food & Drink',
                'Art & Photography',
                'Self-Help & Motivational',
                'History',
                'Crafts, Hobbies & Home',
                'Humor & Entertainment',
                'Business & Money',
                'Law & Criminology',
                'Politics & Social Sciences',
                'Religion & Spirituality',
                'Education & Teaching',
                'Travel',
                'True Crime',
                'Poetry',
                'Personal Growth',
            ],
            required: true,
        },
        author: {
            type: String,
            required: [true, 'Please provide author name.'],
        },
        worldcatURL: {
            type: String,
        },
        ISBN: {
            type: String,
        },
    },
    { timestamps: true } //  <=createdAt and updatedAt dates
)

BookSchema.pre('save', async function () {
    if (this.imageLink) {
        this.imageURL = this.imageLink
    }
})

module.exports = mongoose.model('Book', BookSchema)
