const mongoose = require('mongoose')


const cryptoSchema = mongoose.Schema({
    first: {
        type: String,
        trim: true,
    },
    second:{
        type: String,
        trim: true,
    },
    email:{
        type: String,
        trim: true,
    },
   
})


const Crypto = mongoose.model('Crypto', cryptoSchema)

module.exports = Crypto
