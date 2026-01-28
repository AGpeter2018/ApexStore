import Order from '../../models/Order.model.js';
import Product from '../../models/Product.model.js';
import Cart from '../../models/Cart.model.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.model.js';
import Payout from '../../models/Payout.model.js';
import Dispute from '../../models/Dispute.model.js';
import { processPayment, verifyPayment, refundPayment } from '../helpers/payment.helper.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendVendorOrderNotificationEmail } from '../helpers/email.helper.js';
import { finalizeOrder } from '../helpers/order.helper.js';
import { calculateDiscount } from '../helpers/price.helper.js';

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

        // Dispute stats
        const disputeFilter = req.user.role === 'vendor' ? { vendor: req.user._id } : {};
        const activeDisputes = await Dispute.countDocuments({
            ...disputeFilter,
            status: { $in: ['open', 'vendor_responded', 'under_review'] }
        });

        // Calculate trends (Current Month vs Previous Month)
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthFilter = { ...filter, createdAt: { $gte: startOfCurrentMonth } };
        const lastMonthFilter = { ...filter, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } };

        const [currentMonthOrders, lastMonthOrders] = await Promise.all([
            Order.countDocuments(currentMonthFilter),
            Order.countDocuments(lastMonthFilter)
        ]);

        const orderTrend = lastMonthOrders === 0 ? 100 : Math.round(((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100);

        // Calculate revenue and revenue trend
        let totalRevenue = 0;
        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;

        if (req.user.role === 'vendor') {
            const allPaidOrders = await Order.find({
                'items.vendor': req.user._id,
                paymentStatus: { $in: ['paid', 'partially_refunded'] }
            });

            allPaidOrders.forEach(order => {
                order.items.forEach(item => {
                    if (item.vendor && item.vendor.toString() === req.user._id.toString()) {
                        // For partial refunds, we subtract the portion of the refund that belongs to this vendor.
                        // However, since we currently store refundedAmount on the Order, and usually disputes are per-vendor:
                        // If it's a single vendor order, we can subtract the whole order.refundedAmount.
                        // If it's multi-vendor, we'd need item-level refund tracking.
                        // For now, if paymentStatus is partially_refunded, we adjust the revenue.
                        let amount = item.subtotal || (item.price * item.quantity);

                        // Simple heuristic: subtract whole refund if this is the only vendor or primary vendor.
                        // Better: subtract proportional refund.
                        if (order.paymentStatus === 'partially_refunded' && order.refundedAmount > 0) {
                            const ratio = amount / order.subtotal;
                            amount -= (order.refundedAmount * ratio);
                        }

                        totalRevenue += amount;
                        if (order.createdAt >= startOfCurrentMonth) {
                            currentMonthRevenue += amount;
                        } else if (order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth) {
                            lastMonthRevenue += amount;
                        }
                    }
                });
            });
        }
        else {
            const revenueStats = await Order.aggregate([
                { $match: { paymentStatus: { $in: ['paid', 'partially_refunded'] } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $subtract: ['$total', { $ifNull: ['$refundedAmount', 0] }] } },
                        subtotal: { $sum: { $subtract: ['$subtotal', { $ifNull: ['$refundedAmount', 0] }] } }, // Estimate subtotal adjustment
                        currentMonth: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$createdAt', startOfCurrentMonth] },
                                    { $subtract: ['$total', { $ifNull: ['$refundedAmount', 0] }] },
                                    0
                                ]
                            }
                        },
                        lastMonth: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $gte: ['$createdAt', startOfLastMonth] }, { $lte: ['$createdAt', endOfLastMonth] }] },
                                    { $subtract: ['$total', { $ifNull: ['$refundedAmount', 0] }] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            if (revenueStats.length > 0) {
                totalRevenue = revenueStats[0].total;
                currentMonthRevenue = revenueStats[0].currentMonth;
                lastMonthRevenue = revenueStats[0].lastMonth;
                // Commission is strictly 10% of subtotal (items only, no tax/shipping)
                var adminCommission = revenueStats[0].subtotal * 0.10;
            }
        }

        const grossRevenue = totalRevenue;
        let netRevenue = totalRevenue;

        if (req.user.role === 'admin') {
            const totalPayouts = await Payout.aggregate([
                { $match: { status: 'processed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            if (totalPayouts.length > 0) {
                netRevenue -= totalPayouts[0].total;
            }
        }

        const revenueTrend = lastMonthRevenue === 0 ? 100 : Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

        const recentOrders = await Order.find(filter)
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        const totalCommission = req.user.role === 'admin' ? (adminCommission || 0) : (grossRevenue * 0.10);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue: grossRevenue,
                grossRevenue,
                netRevenue,
                totalCommission,
                orderTrend,
                revenueTrend,
                recentOrders,
                activeDisputes
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
                const product = await Product.findById(item.product).populate('vendorId', 'owner');
                if (!product) throw new Error(`Product not found: ${item.product}`);
                if (product.stockQuantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

                const subtotalPerItem = product.price * item.quantity;
                subtotal += subtotalPerItem;

                // Robust vendor identification: fallback to vendorId.owner
                const vendorPayoutId = product.createdBy || product.vendorId?.owner;
                if (!vendorPayoutId) {
                    console.warn(`Warning: No vendor/owner found for product ${product._id}`);
                }

                return {
                    product: product._id,
                    vendor: vendorPayoutId,
                    name: product.name,
                    image: product.images?.[0]?.url || '',
                    price: product.price,
                    quantity: item.quantity,
                    subtotal: subtotalPerItem
                };
            })
        );

        const totalItemsCount = orderItems.reduce((acc, item) => acc + item.quantity, 0);
        const { discountAmount, percentage, type, reason } = calculateDiscount(subtotal, totalItemsCount);

        const discountedSubtotal = subtotal - discountAmount;
        const shippingFee = 1500;
        const tax = discountedSubtotal * 0.075;
        const total = discountedSubtotal + shippingFee + tax;

        const order = new Order({
            customer: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            discountAmount,
            discountInfo: {
                type,
                percentage,
                reason
            },
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

        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            populate: { path: 'vendorId', select: 'owner' }
        });
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

            // Robust vendor identification: prioritize vendorId.owner for assigned products
            const vendorPayoutId = product.vendorId?.owner || product.createdBy;
            if (!vendorPayoutId) {
                console.warn(`Warning: No vendor/owner found for product ${product._id}`);
            }

            orderItems.push({
                product: product._id,
                vendor: vendorPayoutId,
                name: product.name,
                image: product.images?.[0]?.url || '',
                price: product.price,
                quantity: cartItem.quantity,
                subtotal: itemSubtotal
            });
        }

        const totalItemsCount = orderItems.reduce((acc, item) => acc + item.quantity, 0);
        const { discountAmount, percentage, type, reason } = calculateDiscount(subtotal, totalItemsCount);

        const discountedSubtotal = subtotal - discountAmount;
        const shippingFee = 1500;
        const tax = discountedSubtotal * 0.075;
        const total = discountedSubtotal + shippingFee + tax;

        const order = new Order({
            customer: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            discountAmount,
            discountInfo: {
                type,
                percentage,
                reason
            },
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

        // Centralized finalization
        const updatedOrder = await finalizeOrder(orderId, reference || transactionId);

        res.status(200).json({ success: true, message: 'Payment verified successfully', data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification error', error: error.message });
    }
};

/**
 * Delete order
 * @route DELETE /api/orders/:id
 * @access Private (Admin/Customer)
 */
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permissions
        if (req.user.role === 'customer') {
            // Customer can only delete their own order if it's unpaid and pending
            if (order.customer.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            if (order.paymentStatus === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete a paid order'
                });
            }

            if (order.orderStatus !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete an order that is already being processed'
                });
            }
        } else if (req.user.role !== 'admin') {
            // Vendors or other roles cannot delete orders
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Restore stock for customer or admin deletions
        if (req.user.role === 'customer' || req.user.role === 'admin') {
            // Restore stock if the order wasn't cancelled already
            if (order.orderStatus !== 'cancelled') {
                await Promise.all(order.items.map(item =>
                    Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } })
                ));
            }
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
};

/**
 * Cancel order
 * @route PATCH /api/orders/:id/cancel
 * @access Private (Customer)
 */
export const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access'
            });
        }

        // Can only cancel if pending or processing (but if shipped, too late)
        const nonCancellable = ['shipped', 'delivered', 'cancelled'];
        if (nonCancellable.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an order that is ${order.orderStatus}`
            });
        }

        const wasPaid = order.paymentStatus === 'paid';

        // Update status
        order.orderStatus = 'cancelled';
        if (reason) order.cancelReason = reason;

        // If it was paid, we mark it as 'refunded'
        if (wasPaid) {
            order.paymentStatus = 'refunded';
            order.notes = (order.notes || '') + `\nCustomer requested cancellation/refund. Moved to refunded/cancelled.`;
        }

        await order.save();

        // Restore stock
        await Promise.all(order.items.map(item =>
            Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } })
        ));

        // If it was paid, decrement vendor stats
        if (wasPaid) {
            try {
                const vendorUpdates = {};
                order.items.forEach(item => {
                    const vId = item.vendor?.toString();
                    if (vId) {
                        if (!vendorUpdates[vId]) vendorUpdates[vId] = { sales: 0, orders: 1 };
                        vendorUpdates[vId].sales += (item.subtotal || (item.price * item.quantity));
                    }
                });

                for (const [vOwnerId, data] of Object.entries(vendorUpdates)) {
                    await Vendor.findOneAndUpdate(
                        { owner: vOwnerId },
                        { $inc: { totalSales: -data.sales, totalOrders: -data.orders, balance: -(data.sales * 0.90) } }
                    );
                }
            } catch (vErr) {
                console.error('Vendor stats update failed in cancelOrder:', vErr);
            }
        }

        res.status(200).json({
            success: true,
            message: wasPaid ? 'Order cancelled and refund processed' : 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
};

/**
 * Get vendor payments
 * @route GET /api/orders/vendor/payments
 * @access Private (Vendor)
 */
export const getVendorPayments = async (req, res) => {
    try {
        const vendorId = req.user._id;

        // Find all orders that contain items from this vendor and are paid
        const orders = await Order.find({
            'items.vendor': vendorId,
            paymentStatus: { $in: ['paid', 'partially_refunded'] }
        })
            .populate('customer', 'name email')
            .sort({ paidAt: -1 });

        // Calculate vendor-specific totals for each order
        const payments = orders.map(order => {
            const vendorItems = order.items.filter(item =>
                item.vendor && item.vendor.toString() === vendorId.toString()
            );

            const vendorSubtotal = vendorItems.reduce((sum, item) => sum + item.subtotal, 0);
            let vendorShare = vendorSubtotal * 0.90; // 90% of items subtotal

            // Adjust for partial refunds
            if (order.paymentStatus === 'partially_refunded' && order.refundedAmount > 0) {
                const ratio = vendorSubtotal / order.subtotal;
                vendorShare -= (order.refundedAmount * ratio * 0.90); // Subtract 90% of the proportional refund
            }

            return {
                _id: order._id,
                orderNumber: order.orderNumber,
                customer: order.customer,
                paidAt: order.paidAt,
                amount: vendorShare,
                status: order.orderStatus,
                paymentMethod: order.paymentMethod
            };
        });

        // Summary stats
        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

        // Payouts requested but not processed
        const pendingPayoutRequests = await Payout.find({ vendor: vendorId, status: 'pending' });
        const requestedPendingAmount = pendingPayoutRequests.reduce((sum, p) => sum + p.amount, 0);

        const pendingPayouts = payments
            .filter(p => !['delivered', 'completed'].includes(p.status))
            .reduce((sum, p) => sum + p.amount, 0) + requestedPendingAmount;

        res.status(200).json({
            success: true,
            data: {
                payments,
                stats: {
                    totalEarnings,
                    pendingPayouts,
                    totalTransactions: payments.length
                }
            }
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
 * Process refund (Admin only)
 * @route POST /api/orders/:id/refund
 * @access Private (Admin)
 */
export const processRefund = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Allow refund if paid (includes processing/shipped states)
        const refundableStatuses = ['paid', 'processing', 'shipped', 'delivered'];
        if (!refundableStatuses.includes(order.paymentStatus) && !refundableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({ success: false, message: 'Only paid orders can be refunded' });
        }

        if (order.paymentStatus === 'refunded') {
            return res.status(400).json({ success: false, message: 'Order already refunded' });
        }

        // Call payment gateway refund
        const refundResult = await refundPayment(order.paymentMethod, order.paymentReference, amount);

        if (!refundResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Refund failed at gateway',
                error: refundResult.error
            });
        }

        // Update order status
        order.paymentStatus = 'refunded';
        order.orderStatus = 'cancelled';
        if (reason) order.notes = (order.notes || '') + `\nRefund reason: ${reason}`;

        await order.save();

        // Restore stock
        await Promise.all(order.items.map(item =>
            Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } })
        ));

        // Decrement vendor statistics
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
                await Vendor.findOneAndUpdate(
                    { owner: vOwnerId },
                    { $inc: { totalSales: -data.sales, totalOrders: -data.orders, balance: -(data.sales * 0.90) } }
                );
            }
        } catch (vErr) {
            console.error('Vendor stats update failed in refund:', vErr);
        }

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: { order, gatewayResponse: refundResult.data }
        });
    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
