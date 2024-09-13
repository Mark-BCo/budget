const User = require('../model/user')
const watchSchema = require('../model/watch')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler');
const upload = require('../middleware/multer')

// POST /create-user
const newUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {

        const existingUsername = await User.findOne({ username }).lean().exec();
        if (existingUsername) {
            return res.status(409).json({ message: 'Duplicate username' });
        }

        const existingEmail = await User.findOne({ email }).lean().exec();
        if (existingEmail) {
            return res.status(409).json({ message: 'Duplicate email' });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            email,
            password: hashedPwd
        };

        await User.create(newUser);

        res.status(201).json({ message: `New user ${username} created` });

    } catch (error) {

        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });

    }
});

// PATCH /update-username
// Updates and checks for previous username and pushes username to previous username array
const updateUserName = asyncHandler(async (req, res) => {

    try {
        const { id, username } = req.body;

        if (!id || !username) {
            return res.status(400).json({ message: 'ID and username are required' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.username === username) {
            return res.json({ message: 'Username is the same as the current one. No update needed.' });
        }

        const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean();
        if (duplicate && duplicate._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate username' });
        }

        if (user.previousUsername.includes(username)) {
            return res.status(409).json({ message: 'This username has been used before. Please choose a different username.' });
        }

        user.previousUsername.push(user.username);

        user.username = username;

        await user.save();

        res.json({ message: 'Username updated' });
    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({ message: 'Internal server error' });
    }

})

// PATCH /update-email
// Updates and Checks for previous email and pushes email to previous email array
const updateEmail = asyncHandler(async (req, res) => {

    try {
        const { id, email } = req.body;

        if (!id || !email) {
            return res.status(400).json({ message: 'ID and email are required' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the new email is the same as the current one
        if (user.email === email) {
            return res.json({ message: 'Email is the same as the current one. No update needed.' });
        }

        // Check for duplicate username among other users
        const duplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean();
        if (duplicate && duplicate._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate email' });
        }

        // Check if the new username is in the user's username history
        if (user.previousEmail?.includes(email)) {
            return res.status(409).json({ message: 'This email has been used before. Please choose a different email.' });
        }

        // Add the current email to the username history
        user.previousEmail?.push(user.email);

        // Update the email
        user.email = email;

        // Save the updated user
        await user.save();

        res.json({ message: 'Email updated' });
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: 'Internal server error' });
    }

})

// PATCH /update-userimage
const updateUserImage = asyncHandler(async (req, res) => {

    // File Upload promise
    const file = await new Promise((resolve, reject) => {
        upload.single('userImage')(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(req.file);
            }
        });
    });

    try {

        const { id } = req.body;

        console.log(id)

        const user = await User.findById(id)

        console.log(user)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.userImage = {
            data: file.buffer,
            contentType: file.mimetype,
        }

        await user.save();

        res.json({ message: 'Profile picture added' });

    } catch (error) {
        console.error("Error updating profile picture", error);
        res.status(500).json({ message: 'Internal server error' });
    }

})

// DELETE /delete-user
// Delete a user by ID - deletes all change logs associated with user
const deleteUser = async (req, res) => {

    const { id } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: 'User ID Required' });
        }

        const user = await User.findById(id).exec();

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await user.deleteOne();

        await watchSchema.deleteMany({ documentId: id });

        const changeLogResult = await watchSchema.deleteMany({ documentId: id });
        console.log(`Deleted ${changeLogResult.deletedCount} change log entries for user ID ${id}`);

        const reply = `Username ${user.username} with ID ${user._id} deleted`;

        res.json(reply);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /request-users
const getAllUsers = async (req, res) => {

    const users = await User.find().select('-password').lean()

    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
}

// DELETE /delete-all-users
const deleteAllUsers = async (req, res) => {

    try {

        const result = await User.deleteMany({});

        console.log(`${result.deletedCount} users deleted.`);

        await watchSchema.deleteMany({})
        await watchSchema.deleteMany({})

    } catch (err) {

        console.error('Error deleting users:', err);
    }
}
module.exports = {
    newUser,
    updateUserName,
    updateEmail,
    updateUserImage,
    deleteUser,
    getAllUsers,
    deleteAllUsers,
}