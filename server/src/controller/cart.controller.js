import Cart from '../../models/Cart.model.js';
import Product from '../../models/Product.model.js';

/**
 * Get user's cart
 * @route GET /api/cart
 * @access Private (Customer)
 */
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
};

/**
 * Add item to cart
 * @route POST /api/cart/add
 * @access Private (Customer)
 */
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and get details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock availability
        if (product.stockQuantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
                availableStock: product.stockQuantity
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Prepare item data
        const itemData = {
            product: product._id,
            name: product.name,
            image: product.images?.[0]?.url || '',
            price: product.price,
            quantity,
            stock: product.stockQuantity
        };

        // Add item to cart
        await cart.addItem(itemData);

        // Populate product details
        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};

/**
 * Update item quantity in cart
 * @route PUT /api/cart/update/:productId
 * @access Private (Customer)
 */
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Verify product stock
        const product = await Product.findById(productId);
        if (product && quantity > product.stockQuantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
                availableStock: product.stockQuantity
            });
        }

        // Update quantity
        await cart.updateItemQuantity(productId, quantity);
        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            data: cart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/remove/:productId
 * @access Private (Customer)
 */
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await cart.removeItem(productId);
        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};

/**
 * Clear entire cart
 * @route DELETE /api/cart/clear
 * @access Private (Customer)
 */
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await cart.clearCart();

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};

/**
 * Sync cart items (merge local cart with server cart)
 * @route POST /api/cart/sync
 * @access Private (Customer)
 */
export const syncCart = async (req, res) => {
    try {
        const { items } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Merge items from local storage
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product && product.stockQuantity > 0) {
                const itemData = {
                    product: product._id,
                    name: product.name,
                    image: product.images?.[0]?.url || '',
                    price: product.price,
                    quantity: Math.min(item.quantity, product.stockQuantity),
                    stock: product.stockQuantity
                };
                await cart.addItem(itemData);
            }
        }

        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Cart synced',
            data: cart
        });
    } catch (error) {
        console.error('Sync cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync cart',
            error: error.message
        });
    }
};
