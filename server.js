require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const morgan = require('./middleware/morgan')
const { logger, logEvents } = require('./middleware/logger')
const handle404error = require('./middleware/handle404')
const errorHandler = require('./middleware/error')
const cookieparser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOption')
const watchUser = require('./config/watch')
const mongoose = require('mongoose')
const port = process.env.PORT || 3600

app.use(logger)

app.use(morgan)

app.use(cors(corsOptions))

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use(cookieparser())

app.use('/', express.static(path.join(__dirname, '/public')))

app.use('/', require('./route/root'))
app.use('/user', require('./route/userr'))
app.use('/admin', require('./route/adminr'))

app.all('*', handle404error);

app.use(errorHandler)

mongoose.connect(process.env.DATABASE_URI, {       
}).then(() => {
    console.log('Connected to MongoDB')
    watchUser()
    app.listen(port, () => console.log(`Server running on port ${port}`))
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err)
})

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err)
    logEvents(`${err.name}: ${err.message}\t${err.stack}`, 'mongoErrLog.log')
})

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing MongoDB connection')
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
    process.exit(0)
})

// app.listen(port, () => {
//     console.log(`Server is running on ${port}`)
// })

// mongoose.connection.once('open', () => {
//     console.log('Connected to MongoDB')
//     app.listen(port, () => console.log(`Server running on port ${port}`))
// })

// mongoose.connection.on('error', err => {
//     console.log(err)
//     logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
// })