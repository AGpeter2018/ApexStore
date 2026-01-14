import Dispute from '../../models/Dispute.model.js';
import Order from '../../models/Order.model.js';

/**
 * @desc    Open a new dispute
 * @route   POST /api/disputes
 * @access  Private (Customer)
 */
export const openDispute = async (req, res) => {
    try {
        const { orderId, reason, description, evidence } = req.body;

        // Verify order exists and belongs to the customer
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only dispute your own orders' });
        }

        // Check for existing dispute
        const existingDispute = await Dispute.findOne({ order: orderId });
        if (existingDispute) {
            return res.status(400).json({ success: false, message: 'A dispute already exists for this order' });
        }

        // Identify the vendor(s) involved. For simplicity, we assume one vendor per dispute.
        // If an order has multiple vendors, the customer might need to pick the item/vendor.
        // For now, we take the vendor from the first item.
        const vendorId = order.items[0].vendor;

        const dispute = await Dispute.create({
            order: orderId,
            customer: req.user._id,
            vendor: vendorId,
            reason,
            description,
            evidence: evidence || [],
            status: 'open'
        });

        res.status(201).json({
            success: true,
            message: 'Dispute opened successfully',
            data: dispute
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all disputes (filtered by role)
 * @route   GET /api/disputes
 * @access  Private
 */
export const getDisputes = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'customer') {
            query.customer = req.user._id;
        } else if (req.user.role === 'vendor') {
            query.vendor = req.user._id;
        }
        // Admin sees all

        const disputes = await Dispute.find(query)
            .populate('order', 'orderNumber total orderStatus createdAt')
            .populate('customer', 'name email')
            .populate('vendor', 'name email storeName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: disputes.length,
            data: disputes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get single dispute details
 * @route   GET /api/disputes/:id
 * @access  Private
 */
export const getDisputeById = async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id)
            .populate('order', 'orderNumber total orderStatus items shippingAddress')
            .populate('customer', 'name email')
            .populate('vendor', 'name email storeName')
            .populate('responses.user', 'name role');

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        // Check if user is authorized to view this dispute
        if (req.user.role !== 'admin' &&
            dispute.customer._id.toString() !== req.user._id.toString() &&
            dispute.vendor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this dispute' });
        }

        res.status(200).json({
            success: true,
            data: dispute
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Respond to a dispute
 * @route   POST /api/disputes/:id/respond
 * @access  Private
 */
export const respondToDispute = async (req, res) => {
    try {
        const { message, attachments } = req.body;
        const dispute = await Dispute.findById(req.params.id);

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        // Check if user is authorized to respond
        if (req.user.role !== 'admin' &&
            dispute.customer.toString() !== req.user._id.toString() &&
            dispute.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to respond' });
        }

        const newResponse = {
            user: req.user._id,
            message,
            attachments: attachments || []
        };

        dispute.responses.push(newResponse);

        // Update status based on who responded
        if (req.user.role === 'vendor') {
            dispute.status = 'vendor_responded';
        } else if (req.user.role === 'admin') {
            dispute.status = 'under_review';
        }

        await dispute.save();

        res.status(200).json({
            success: true,
            message: 'Response added successfully',
            data: dispute
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Resolve a dispute (Admin only)
 * @route   PATCH /api/disputes/:id/resolve
 * @access  Private (Admin)
 */
export const resolveDispute = async (req, res) => {
    try {
        const { action, adminNote } = req.body;
        const dispute = await Dispute.findById(req.params.id);

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        dispute.adminDecision = {
            action,
            note: adminNote,
            decidedBy: req.user._id,
            decidedAt: new Date()
        };

        dispute.status = 'resolved';

        // Additional business logic for resolution
        if (action === 'full_refund') {
            // In a real app, this would trigger a payment gateway refund
            // For now, we update order status
            await Order.findByIdAndUpdate(dispute.order, {
                paymentStatus: 'refunded',
                orderStatus: 'cancelled'
            });
        }

        await dispute.save();

        res.status(200).json({
            success: true,
            message: 'Dispute resolved successfully',
            data: dispute
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
