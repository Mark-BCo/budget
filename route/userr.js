const express = require('express')
const router = express.Router()
const userc = require('../control/userc')

router.route('/create-user').post(userc.newUser)

router.route('/update-username').patch(userc.updateUserName)

router.route('/update-email').patch(userc.updateEmail)

router.route('/delete-user').delete(userc.deleteUser)

router.route('/get-users').get(userc.getAllUsers)

module.exports = router