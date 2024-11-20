const User = require('../model/user');
const watchSchema = require('../model/watch');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const upload = require('../middleware/multer');
const { validateUserInput, findUserById, checkForDuplicate } = require('./utility')

// POST /create-user
const newUser = asyncHandler(async (req, res) => {
    const { username, email, password, roles } = req.body;

    const validationError = validateUserInput(username, email, password);
    if (validationError) return res.status(400).json({ message: validationError });

    if (await checkForDuplicate('username', username)) {
        return res.status(409).json({ message: 'Duplicate username' });
    }
    if (await checkForDuplicate('email', email)) {
        return res.status(409).json({ message: 'Duplicate email' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashedPwd, roles };

    await User.create(newUser);
    res.status(201).json({ message: `New user ${username} created` });
});

// PATCH /update-username
const updateUserName = asyncHandler(async (req, res) => {
    const { id, username } = req.body;
    if (!id || !username) return res.status(400).json({ message: 'ID and username are required' });

    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.username === username) return res.json({ message: 'Username is the same' });

    if (await checkForDuplicate('username', username, id)) {
        return res.status(409).json({ message: 'Duplicate username' });
    }
    if (user.previousUsername.includes(username)) {
        return res.status(409).json({ message: 'This username has been used before' });
    }

    user.previousUsername.push(user.username);
    user.username = username;
    await user.save();
    res.status(200).json({ message: `Username ${user.username} updated` });
});

// PATCH /update-email
const updateEmail = asyncHandler(async (req, res) => {
    const { id, email } = req.body;
    if (!id || !email) return res.status(400).json({ message: 'ID and email are required' });

    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.email === email) return res.json({ message: 'Email is the same' });

    if (await checkForDuplicate('email', email, id)) {
        return res.status(409).json({ message: 'Duplicate email' });
    }
    if (user.previousEmail?.includes(email)) {
        return res.status(409).json({ message: 'This email has been used before' });
    }

    user.previousEmail?.push(user.email);
    user.email = email;
    await user.save();
    res.status(200).json({ message: 'Email updated' });
});

// PATCH /update-userimage
const updateUserImage = asyncHandler(async (req, res) => {
    const file = await new Promise((resolve, reject) => {
        upload.single('userImage')(req, res, (err) => (err ? reject(err) : resolve(req.file)));
    });

    const { id } = req.body;
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.userImage = { data: file.filename, contentType: file.mimetype };
    await user.save();
    res.status(200).json(req.file);
});

// DELETE /delete-user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'User ID required' });

    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    const changeLogResult = await watchSchema.deleteMany({ documentId: id });
    console.log(`Deleted ${changeLogResult.deletedCount} change log entries for user ID ${id}`);

    await watchSchema.deleteMany({});

    res.status(200).json({ message: `User ${user.username} deleted` });
});

// GET /request-users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) return res.status(200).json({ message: 'No users found' });
    res.status(200).json(users);
});

// DELETE /delete-all-users
const deleteAllUsers = asyncHandler(async (req, res) => {
    const result = await User.deleteMany({});
    console.log(`${result.deletedCount} users deleted.`);

    await watchSchema.deleteMany({});
    res.json(result);
});

module.exports = {
    newUser,
    updateUserName,
    updateEmail,
    updateUserImage,
    deleteUser,
    getAllUsers,
    deleteAllUsers,
};
