const asyncHandler = require('express-async-handler')
const Income = require('../model/income')
const User = require('../model/user')

const newIncome = asyncHandler(async (req, res) => {

    const { user, source, amount, frequency, dateReceived, notes } = req.body

    if (!user || !source || !amount || !frequency) {
        return res.status(400).json({ message: "Source, amount and frequency are required, please try again." })
    }

    const income = await Income.create({
        user,
        source,
        amount,
        frequency,
        dateReceived,
        notes,
    });

    if (income) {
        res.status(201).json({
            message: 'Income added successfully.',
            income,
        });
    } else {
        res.status(500).json({ message: 'Failed to add income.' });
    }
})

// @desc Get income records for a user
// @route GET /income/get-income
// @access Private
const getIncome = asyncHandler(async (req, res) => {
    const incomes = await Income.find().lean()

    if (!incomes?.length) {
        return res.status(400).json({ message: 'No incomes found' })
    }

    const incomeWithUser = await Promise.all(incomes.map(async (income) => {
        const user = await User.findById(income.user).lean().exec()
        return { ...income, username: user.username }
    }))

    res.json(incomeWithUser)
});



module.exports = {
    newIncome,
    getIncome
}