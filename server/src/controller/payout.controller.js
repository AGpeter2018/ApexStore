import Payout from '../../models/Payout.model.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.model.js';

/**
 * Request a payout (Vendor)
 * @route POST /api/payouts/request
 * @access Private (Vendor)
 */
export const requestPayout = async (req, res) => {
    try {
        const { amount, bankDetails } = req.body;
        const vendorId = req.user._id;

        const vendor = await Vendor.findOne({ owner: vendorId });
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

        if (amount > vendor.balance) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Use provided bank details or vendor's saved details
        const finalBankDetails = bankDetails || vendor.bankDetails;
        if (!finalBankDetails || !finalBankDetails.accountNumber) {
            return res.status(400).json({ success: false, message: 'Bank details required' });
        }

        const payout = await Payout.create({
            vendor: vendorId,
            amount,
            bankDetails: finalBankDetails,
            status: 'pending'
        });

        // Deduct from balance immediately to prevent double-spending
        vendor.balance -= amount;
        await vendor.save();

        res.status(201).json({ success: true, data: payout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * Get payout history
 * @route GET /api/payouts
 * @access Private (Vendor/Admin)
 */
export const getPayouts = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'vendor') {
            filter.vendor = req.user._id;
        }

        const payouts = await Payout.find(filter)
            .populate('vendor', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * Process a payout (Admin)
 * @route PATCH /api/payouts/:id/process
 * @access Private (Admin)
 */
export const processPayout = async (req, res) => {
    try {
        const { status, reference, error } = req.body;
        const payout = await Payout.findById(req.params.id);

        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });
        if (payout.status !== 'pending') return res.status(400).json({ success: false, message: 'Payout already processed' });

        payout.status = status; // 'processed' or 'failed'
        if (reference) payout.reference = reference;
        if (error) payout.error = error;
        payout.processedAt = new Date();
        await payout.save();

        // If failed, return balance to vendor
        if (status === 'failed') {
            await Vendor.findOneAndUpdate(
                { owner: payout.vendor },
                { $inc: { balance: payout.amount } }
            );
        }

        res.status(200).json({ success: true, data: payout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
