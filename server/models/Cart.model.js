import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    stock: {
        type: Number,
        required: true
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', async function () {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function (productData) {
    const existingItemIndex = this.items.findIndex(
        item => item.product.toString() === productData.product.toString()
    );

    if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        this.items[existingItemIndex].quantity += productData.quantity;

        // Ensure quantity doesn't exceed stock
        if (this.items[existingItemIndex].quantity > productData.stock) {
            this.items[existingItemIndex].quantity = productData.stock;
        }
    } else {
        // Add new item
        this.items.push(productData);
    }

    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
    const item = this.items.find(item => item.product.toString() === productId.toString());

    if (item) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            this.items = this.items.filter(item => item.product.toString() !== productId.toString());
        } else {
            // Update quantity (ensure it doesn't exceed stock)
            item.quantity = Math.min(quantity, item.stock);
        }
    }

    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(item => item.product.toString() !== productId.toString());
    return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
    this.items = [];
    return this.save();
};

export default mongoose.model('Cart', cartSchema);
