const express = require('express')
const router = express.Router()
const authC = require('../control/authc')
const limit = require('../middleware/limit')

router.route('/')
    .post(limit, authC.login)

router.route('/refresh')
    .get(authC.refresh)

router.route('/logout')
    .post(authC.logout)

module.exports = router