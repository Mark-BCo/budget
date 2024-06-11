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
    },
    userImage: {
        data: Buffer,
        contentType: String,
    },
    roles: {
        type: String,
        enum: ['user', 'admin', 'moderator', 'manager'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active'
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)