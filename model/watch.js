const mongoose = require('mongoose')

const watchSchema = new mongoose.Schema({
    documentId: mongoose.Schema.Types.ObjectId,
    operation: String,
    updatedFields: Object,
    removedFields: [String],
    newDocument: Object,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watch', watchSchema)