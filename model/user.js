const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    previousUsername: {
        type: [{type: String}],
        default: []
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    previousEmail: {
        type: [{type: String}],
        default: []
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)