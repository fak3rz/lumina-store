const { mongoose } = require('../connection');

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    passwordSalt: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,       // auto createdAt & updatedAt
    collection: 'users'
});

module.exports = mongoose.model('User', userSchema);
