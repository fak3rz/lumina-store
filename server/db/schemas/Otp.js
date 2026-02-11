const { mongoose } = require('../connection');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    code: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['verify', 'reset', 'login']
    },
    expiresAt: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    collection: 'otps'
});

// TTL index: MongoDB will auto-delete documents when expiresAt passes
// We store expiresAt as unix ms, so we use a TTL on a Date field instead
otpSchema.index({ email: 1 });

module.exports = mongoose.model('Otp', otpSchema);
