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
const db = require('./config/db')
const watchUser = require('./config/watch')
const mongoose = require('mongoose')
const port = process.env.port || 3600

console.log(process.env.NODE_ENV)

db()

watchUser()

app.use(logger)

app.use(morgan)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieparser())

app.use('/', express.static(path.join(__dirname, '/public')))

app.use('/', require('./route/root'))
app.use('/user', require('./route/userr'))

app.all('*', handle404error);

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

// mongoose.connection.once('open', () => {
//     console.log('Connected to MongoDB')
//     app.listen(port, () => console.log(`Server running on port ${port}`))
// })

// mongoose.connection.on('error', err => {
//     console.log(err)
//     logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
// })