import Order from '../../models/Order.model.js';
import Product from '../../models/Product.model.js';


// Get all orders (filtered by vendor)
export const getOrders = async (req, res) => {
    try {
        const { status, paymentStatus, vendorId, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        // CRITICAL: If user is a vendor, only show orders containing their products
        // If user is admin and vendorId is provided, filter by that vendor
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

// Get single order (with ownership check)
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

        // CRITICAL: Check if vendor has access to this order
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

// Update order status (with ownership check)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, trackingNumber, notes } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // CRITICAL: Check if vendor has access to this order
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

        if (orderStatus) order.orderStatus = orderStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (notes) order.notes = notes;

        if (orderStatus === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get order statistics (filtered by vendor)
export const getOrderStats = async (req, res) => {
    try {
        let filter = {};

        // CRITICAL: Filter stats by vendor
        if (req.user.role === 'vendor') {
            filter = { 'items.vendor': req.user._id };
        }

        const totalOrders = await Order.countDocuments(filter);
        const pendingOrders = await Order.countDocuments({ ...filter, orderStatus: 'pending' });
        const processingOrders = await Order.countDocuments({ ...filter, orderStatus: 'processing' });
        const shippedOrders = await Order.countDocuments({ ...filter, orderStatus: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ ...filter, orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ ...filter, orderStatus: 'cancelled' });

        // Calculate revenue (only from vendor's items)
        let totalRevenue = 0;
        if (req.user.role === 'vendor') {
            const orders = await Order.find(filter);
            orders.forEach(order => {
                order.items.forEach(item => {
                    if (item.vendor && item.vendor.toString() === req.user._id.toString()) {
                        totalRevenue += item.subtotal;
                    }
                });
            });
        } else {
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
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Create order (Customer only)
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            notes
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items required"
            });
        }

        // Calculate subtotal and prepare order items
        let subtotal = 0;

        const orderItems = await Promise.all(
            items.map(async item => {
                const product = await Product.findById(item.product);

                if (!product) {
                    throw new Error(`Product not found: ${item.product}`);
                }

                // Check stock
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                const subtotalPerItem = product.price * item.quantity;
                subtotal += subtotalPerItem;

                return {
                    product: product._id,
                    vendor: product.createdBy,
                    name: product.name,
                    image: product.images?.[0]?.url || '', // Get first image from images array
                    price: product.price,
                    quantity: item.quantity,
                    subtotal: subtotalPerItem
                };
            })
        );

        const shippingFee = 1500;
        const tax = subtotal * 0.075; // 7.5% tax
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

        // Populate before sending response
        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name slug images price');

        res.status(201).json({
            success: true,
            data: populatedOrder
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get customer's own orders
export const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const filter = { customer: req.user._id };
        if (status) filter.orderStatus = status;

        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .populate('items.product', 'name slug images price')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);

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
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};