import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer'],
        default: 'bank_transfer'
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        bankCode: String
    },
    reference: {
        type: String,
        unique: true,
        sparse: true
    },
    error: String,
    processedAt: Date
}, {
    timestamps: true
});

export default mongoose.model('Payout', payoutSchema);
