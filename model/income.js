const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        enum: ['One-time', 'Weekly', 'Monthly', 'Yearly'],
        required: true
    },
    dateReceived: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String
    }
})

module.exports = mongoose.model('Income', incomeSchema)