const express = require('express')
const router = express.Router()
const incomec = require('../control/incomec')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/create-income').post(incomec.newIncome)
router.route('/get-income').get(incomec.getIncome)

module.exports = router