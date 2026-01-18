import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'  // Track which vendor owns this product
        },
        name: String,
        image: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: Number
    }],
    shippingAddress: {
        name: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'paystack', 'flutterwave', 'cash_on_delivery'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    paymentReference: {
        type: String,
        trim: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    cancelReason: {
        type: String,
        trim: true
    },
    deliveredAt: Date,
    paidAt: Date,
    refundedAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('validate', async function () {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        const random = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `ORD-${Date.now()}-${count + 1}-${random}`;
    }

});

export default mongoose.model('Order', orderSchema);
