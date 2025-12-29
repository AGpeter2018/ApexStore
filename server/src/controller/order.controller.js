import Order from '../../models/Order.model.js';
import Product from '../../models/Product.model.js';
import Cart from '../../models/Cart.model.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.model.js';
import { processPayment, verifyPayment } from '../helpers/payment.helper.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendVendorOrderNotificationEmail } from '../helpers/email.helper.js';

/**
 * Get all orders
 * @route GET /api/orders
 * @access Private (Admin/Vendor)
 */
export const getOrders = async (req, res) => {
    try {
        const { status, paymentStatus, vendorId, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        // CRITICAL: Filter by vendor ownership
        if (req.user.role === 'vendor') {
            filter['items.vendor'] = req.user._id;
        } else if (req.user.role === 'admin' && vendorId) {
            filter['items.vendor'] = vendorId;
        }

        const orders = await Order.find(filter)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // For vendors, filter items to only show their products
        if (req.user.role === 'vendor') {
            orders.forEach(order => {
                order.items = order.items.filter(item =>
                    item.vendor && item.vendor.toString() === req.user._id.toString()
                );
            });
        }

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get single order
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check access permissions
        if (req.user.role === 'vendor') {
            const hasAccess = order.items.some(item =>
                item.vendor && item.vendor.toString() === req.user._id.toString()
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to view this order'
                });
            }

            // Filter to show only vendor's items
            order.items = order.items.filter(item =>
                item.vendor && item.vendor.toString() === req.user._id.toString()
            );
        } else if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update order status
 * @route PATCH /api/orders/:id/status
 * @access Private (Admin/Vendor)
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, trackingNumber, notes } = req.body;

        const order = await Order.findById(req.params.id).populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check access
        if (req.user.role === 'vendor') {
            const hasAccess = order.items.some(item =>
                item.vendor && item.vendor.toString() === req.user._id.toString()
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to update this order'
                });
            }
        }

        const previousStatus = order.orderStatus;

        if (orderStatus) order.orderStatus = orderStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (notes) order.notes = notes;

        if (orderStatus === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        // Send email notification if status changed
        if (orderStatus && orderStatus !== previousStatus) {
            try {
                await sendOrderStatusUpdateEmail(order, order.customer, orderStatus);
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Order update failed',
            error: error.message
        });
    }
};

/**
 * Get order statistics
 * @route GET /api/orders/stats
 * @access Private (Admin/Vendor)
 */
export const getOrderStats = async (req, res) => {
    try {
        let filter = {};

        // Filter stats by vendor
        if (req.user.role === 'vendor') {
            filter = { 'items.vendor': req.user._id };
        }

        const totalOrders = await Order.countDocuments(filter);
        const pendingOrders = await Order.countDocuments({ ...filter, orderStatus: 'pending' });
        const processingOrders = await Order.countDocuments({ ...filter, orderStatus: 'processing' });
        const shippedOrders = await Order.countDocuments({ ...filter, orderStatus: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ ...filter, orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ ...filter, orderStatus: 'cancelled' });

        // Calculate revenue
        let totalRevenue = 0;
        if (req.user.role === 'vendor') {
            // Vendors only get revenue from THEIR items in PAID orders
            const orders = await Order.find({ ...filter, paymentStatus: 'paid' });
            orders.forEach(order => {
                order.items.forEach(item => {
                    if (item.vendor && item.vendor.toString() === req.user._id.toString()) {
                        totalRevenue += item.subtotal;
                    }
                });
            });
        } else {
            // Admins get total order revenue
            const revenueResult = await Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]);
            totalRevenue = revenueResult[0]?.total || 0;
        }

        const recentOrders = await Order.find(filter)
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

/**
 * Create manual order (Admin/Customer)
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items required"
            });
        }

        let subtotal = 0;
        const orderItems = await Promise.all(
            items.map(async item => {
                const product = await Product.findById(item.product);
                if (!product) throw new Error(`Product not found: ${item.product}`);
                if (product.stockQuantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

                const subtotalPerItem = product.price * item.quantity;
                subtotal += subtotalPerItem;

                return {
                    product: product._id,
                    vendor: product.createdBy,
                    name: product.name,
                    image: product.images?.[0]?.url || '',
                    price: product.price,
                    quantity: item.quantity,
                    subtotal: subtotalPerItem
                };
            })
        );

        const shippingFee = 1500;
        const tax = subtotal * 0.075;
        const total = subtotal + shippingFee + tax;

        const order = new Order({
            customer: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingFee,
            tax,
            total,
            notes
        });

        await order.save();

        // Reduce stock
        await Promise.all(orderItems.map(item =>
            Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } })
        ));

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name slug images price');

        // Emails
        try {
            await sendOrderConfirmationEmail(populatedOrder, req.user);
            const vendorIds = [...new Set(populatedOrder.items.map(item => item.vendor?.toString()).filter(Boolean))];
            for (const vId of vendorIds) {
                const vendor = await User.findById(vId);
                if (vendor) {
                    const vendorItems = populatedOrder.items.filter(item => item.vendor?.toString() === vId);
                    await sendVendorOrderNotificationEmail(populatedOrder, vendor, vendorItems);
                }
            }
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }

        res.status(201).json({ success: true, data: populatedOrder });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Get customer orders
 * @route GET /api/orders/my
 * @access Private (Customer)
 */
export const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const filter = { customer: req.user._id };
        if (status) filter.orderStatus = status;

        const orders = await Order.find(filter)
            .populate('items.product', 'name slug images price')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Checkout - Convert cart to order
 * @route POST /api/orders/checkout
 * @access Private (Customer)
 */
export const checkout = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, notes } = req.body;

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address and payment method are required'
            });
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const orderItems = [];
        let subtotal = 0;

        for (const cartItem of cart.items) {
            const product = cartItem.product;
            if (!product) continue;
            if (product.stockQuantity < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemSubtotal = product.price * cartItem.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                vendor: product.createdBy,
                name: product.name,
                image: product.images?.[0]?.url || '',
                price: product.price,
                quantity: cartItem.quantity,
                subtotal: itemSubtotal
            });
        }

        const shippingFee = 1500;
        const tax = subtotal * 0.075;
        const total = subtotal + shippingFee + tax;

        const order = new Order({
            customer: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingFee,
            tax,
            total,
            notes
        });

        await order.save();

        let paymentResult = null;
        if (paymentMethod !== 'cash_on_delivery') {
            const paymentData = {
                email: req.user.email,
                amount: total,
                orderId: order._id,
                customerName: req.user.name,
                metadata: { orderNumber: order.orderNumber }
            };
            paymentResult = await processPayment(paymentMethod, paymentData);

            if (paymentResult?.success) {
                order.paymentReference = paymentResult.reference || paymentResult.data?.tx_ref;
                await order.save();
            } else {
                await Order.findByIdAndDelete(order._id);
                return res.status(400).json({
                    success: false,
                    message: 'Payment initialization failed',
                    error: paymentResult?.error
                });
            }
        }

        // Reduce stock and clear cart
        await Promise.all(orderItems.map(item =>
            Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } })
        ));
        await cart.clearCart();

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name slug images price');

        try {
            await sendOrderConfirmationEmail(populatedOrder, req.user);
        } catch (e) { console.error('Email error:', e); }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order: populatedOrder, payment: paymentResult }
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
    }
};

/**
 * Verify payment
 * @route POST /api/orders/:id/verify-payment
 * @access Private
 */
export const verifyOrderPayment = async (req, res) => {
    try {
        const { reference, transactionId } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId).populate('customer', 'name email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ success: true, message: 'Payment already verified', data: order });
        }

        if (order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const verificationResult = await verifyPayment(order.paymentMethod, reference || transactionId);
        if (!verificationResult.success) {
            order.paymentStatus = 'failed';
            await order.save();
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        order.orderStatus = 'processing';
        await order.save();

        // Update vendor statistics (Atomic Upsert)
        try {
            const vendorUpdates = {};
            order.items.forEach(item => {
                const vId = item.vendor?.toString();
                if (vId) {
                    if (!vendorUpdates[vId]) vendorUpdates[vId] = { sales: 0, orders: 1 };
                    vendorUpdates[vId].sales += item.subtotal;
                }
            });

            for (const [vOwnerId, data] of Object.entries(vendorUpdates)) {
                const ownerUser = await User.findById(vOwnerId);
                const storeName = ownerUser ? `${ownerUser.name}'s Store` : `Vendor ${vOwnerId}`;

                await Vendor.findOneAndUpdate(
                    { owner: vOwnerId },
                    {
                        $inc: { totalSales: data.sales, totalOrders: data.orders },
                        $setOnInsert: { storeName, isApproved: false, isActive: true }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }
        } catch (vErr) {
            console.error('Vendor stats update failed:', vErr);
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification error', error: error.message });
    }
};
