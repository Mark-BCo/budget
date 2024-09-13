const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Assuming you'll use bcrypt for hashing passwords

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true // Adds an index for faster lookups
    },
    previousUsername: {
        type: [{ type: String }],
        default: []
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true, // Adds an index for faster lookups
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    previousEmail: {
        type: [{ type: String }],
        default: []
    },
    password: {
        type: String,
        required: true
    },
    userImage: {
        data: Buffer,
        contentType: String,
    },
    roles: {
        type: [String],
        enum: ['user', 'admin', 'moderator', 'manager'],
        default: ['user']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active'
    }
}, { timestamps: true });

// Pre-save middleware to hash the password before saving it
userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        return next();
    }
});

module.exports = mongoose.model('User', userSchema);
