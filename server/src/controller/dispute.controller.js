import Dispute from '../../models/Dispute.model.js';
import Order from '../../models/Order.model.js';
import User from '../../models/User.model.js';
import {
    sendDisputeOpenedEmail,
    sendDisputeResponseEmail,
    sendDisputeResolvedEmail
} from '../helpers/email.helper.js';
import { refundPayment } from '../helpers/payment.helper.js';

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

        // Send email notifications
        const vendor = await User.findById(vendorId);
        if (vendor) {
            await sendDisputeOpenedEmail(dispute, order, req.user, vendor);
        }

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

        // Send email notification to other party
        let recipientId;
        if (req.user.role === 'customer') {
            recipientId = dispute.vendor;
        } else if (req.user.role === 'vendor') {
            recipientId = dispute.customer;
        } else {
            // Admin response - notify both? Or just one. 
            // For now notify customer.
            recipientId = dispute.customer;
        }

        const recipient = await User.findById(recipientId);
        if (recipient) {
            await sendDisputeResponseEmail(dispute, req.user, recipient);
        }

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
        const order = await Order.findById(dispute.order);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order for this dispute not found' });
        }

        if (action === 'full_refund' || action === 'partial_refund') {
            // Be extra defensive with refundAmount extraction
            let refundAmountRaw = req.body.refundAmount;

            // Just in case it's nested (though it shouldn't be with the current thunk)
            if (refundAmountRaw === undefined && req.body.resolutionData) {
                refundAmountRaw = req.body.resolutionData.refundAmount;
            }

            const refundAmount = action === 'full_refund' ? Number(order.total) : Number(refundAmountRaw);

            if (action === 'partial_refund' && (isNaN(refundAmount) || refundAmount <= 0)) {
                return res.status(400).json({ success: false, message: 'Refund amount is required for partial refund' });
            }

            if (action === 'partial_refund' && refundAmount > order.total) {
                return res.status(400).json({ success: false, message: `Refund amount (₦${refundAmount}) cannot exceed order total (₦${order.total})` });
            }

            // Trigger gateway refund
            const refundResult = await refundPayment(order.paymentMethod, order.paymentReference, refundAmount);

            if (!refundResult.success) {
                // If the gateway refund fails, we don't resolve the dispute yet but inform the admin
                return res.status(400).json({
                    success: false,
                    message: `Gateway refund failed: ${refundResult.error}. Please ensure merchant account has sufficient funds.`,
                    error: refundResult.error
                });
            }

            // Update order status/notes based on refund type
            if (action === 'full_refund') {
                order.paymentStatus = 'refunded';
                order.orderStatus = 'cancelled';
                order.refundedAmount = (order.refundedAmount || 0) + Number(refundAmount);
                order.notes = (order.notes || '') + `\n[System]: Full refund of ${refundAmount} processed via dispute resolution. Ref: ${refundResult.data?.id || 'N/A'}`;
            } else {
                order.paymentStatus = 'partially_refunded';
                order.refundedAmount = (order.refundedAmount || 0) + Number(refundAmount);
                order.notes = (order.notes || '') + `\n[System]: Partial refund of ${refundAmount} processed via dispute resolution. Ref: ${refundResult.data?.id || 'N/A'}`;
                dispute.resolutionDetails = {
                    refundAmount: Number(refundAmount),
                    transactionId: refundResult.data?.id || `PARTIAL-${Date.now()}`
                };
            }
            await order.save();

            // Additional logic for full refunds: restore stock and sync vendor stats
            if (action === 'full_refund') {
                try {
                    // Import Product and Vendor models inside if needed or add to file top
                    const Product = (await import('../../models/Product.model.js')).default;
                    const Vendor = (await import('../../models/Vendor.js')).default;

                    // Restore stock
                    await Promise.all(order.items.map(item =>
                        Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } })
                    ));

                    // Decrement vendor statistics
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
                } catch (extraErr) {
                    console.error('Resolution extra logic failed (stock/stats):', extraErr);
                    // We don't fail the whole request since gateway refund succeeded
                }
            } else if (action === 'partial_refund') {
                // For partial refund, decrement vendor balance/sales by refund amount
                try {
                    const Vendor = (await import('../../models/Vendor.js')).default;

                    // dispute.vendor is the User ID (owner) of the store
                    // We also try to look at the order items if dispute.vendor is missing or wrong
                    const vendorOwnerId = dispute.vendor?._id || dispute.vendor || order.items[0]?.vendor;

                    if (vendorOwnerId) {
                        // 1. Try finding by owner (User ID)
                        let vendorDoc = await Vendor.findOne({ owner: vendorOwnerId });

                        // 2. Fallback: try finding by _id (just in case the ID passed was a Vendor ID)
                        if (!vendorDoc) {
                            vendorDoc = await Vendor.findById(vendorOwnerId);
                        }

                        if (vendorDoc) {
                            const vendorDeduction = Number(refundAmount) * 0.90; // Match 10% commission
                            vendorDoc.totalSales -= Number(refundAmount);
                            vendorDoc.balance -= vendorDeduction;
                            await vendorDoc.save();
                        } else {
                            console.log('ERROR: No vendor found for ID:', vendorOwnerId);
                        }
                    }
                } catch (extraErr) {
                    console.error('Resolution partial extra logic failed:', extraErr);
                }
            }
        }

        await dispute.save();

        // Send resolution emails
        const customer = await User.findById(dispute.customer);
        const vendor = await User.findById(dispute.vendor);

        if (customer && vendor && order) {
            await sendDisputeResolvedEmail(dispute, order, customer, vendor);
        }

        res.status(200).json({
            success: true,
            message: 'Dispute resolved successfully',
            data: dispute
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
