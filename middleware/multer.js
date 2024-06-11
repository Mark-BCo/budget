const multer = require('multer')
const path = require('path')

// Storing the photo uploads in the disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

// returning the multer instance - multer is used in the updateUser function for uploading photos
const upload = multer({ storage: storage })

module.exports = upload