const { mongoose } = require('../connection');

const orderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true
    },
    zoneId: {
        type: String,
        default: ''
    },
    sku: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'paid', 'failed', 'expired'],
        default: 'created'
    },
    fulfillment: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        }
    },
    paymentUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'orders'
});

// Indexes for common queries
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
