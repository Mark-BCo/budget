const User = require('../model/user');

// Utility Functions
const validateUserInput = (username, email, password) => {
    if (!username || !email || !password) return "All fields are required";

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) return "Invalid email format";

    return null;
};

const findUserById = async (id) => {
    return await User.findById(id);
};

const checkForDuplicate = async (field, value, id = null) => {
    const query = {};
    query[field] = value;
    const user = await User.findOne(query).collation({ locale: 'en', strength: 2 }).lean();
    if (user && (!id || user._id.toString() !== id)) {
        return true;
    }
    return false;
};

module.exports = {
    validateUserInput,
    findUserById,
    checkForDuplicate
}