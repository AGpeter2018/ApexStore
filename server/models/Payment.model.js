import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentGateway: {
        type: String,
        enum: ['paystack', 'flutterwave', 'stripe', 'bank_transfer', 'cash'],
        default: 'paystack'
    },
    paymentReference: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed', 'refunded'],
        default: 'pending'
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    paidAt: Date,
    refundedAt: Date,
    refundReason: String
}, {
    timestamps: true
});

export default mongoose.model('Payment', paymentSchema);

