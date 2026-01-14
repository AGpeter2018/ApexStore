import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
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
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'item_not_received',
            'damaged_item',
            'wrong_item',
            'quality_issue',
            'delivery_delayed',
            'return_refund',
            'other'
        ]
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    evidence: [{
        url: String,
        publicId: String
    }],
    status: {
        type: String,
        required: true,
        enum: ['open', 'vendor_responded', 'customer_action_required', 'under_review', 'resolved', 'cancelled'],
        default: 'open'
    },
    responses: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        attachments: [String],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    adminDecision: {
        action: {
            type: String,
            enum: ['none', 'full_refund', 'partial_refund', 'deny_claim', 'replacement'],
            default: 'none'
        },
        note: String,
        decidedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        decidedAt: Date
    },
    resolutionDetails: {
        refundAmount: Number,
        transactionId: String
    }
}, {
    timestamps: true
});

// Indexing for faster lookups
disputeSchema.index({ order: 1 });
disputeSchema.index({ customer: 1 });
disputeSchema.index({ vendor: 1 });
disputeSchema.index({ status: 1 });

export default mongoose.model('Dispute', disputeSchema);
