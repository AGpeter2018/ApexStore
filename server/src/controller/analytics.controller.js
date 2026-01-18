import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.js';
import User from '../../models/User.model.js';
import Payout from '../../models/Payout.model.js';
import mongoose from 'mongoose';

/**
 * Get vendor-specific analytics
 * @route GET /api/analytics/vendor
 * @access Private (Vendor)
 */
export const getVendorAnalytics = async (req, res) => {
    try {
        const vendorId = new mongoose.Types.ObjectId(req.user._id);

        // 1. Revenue Over Time (Last 30 days, grouped by day)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueTrend = await Order.aggregate([
            {
                $match: {
                    'items.vendor': vendorId,
                    paymentStatus: { $in: ['paid', 'partially_refunded'] },
                    paidAt: { $gte: thirtyDaysAgo }
                }
            },
            { $unwind: '$items' },
            {
                $match: { 'items.vendor': vendorId }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                    revenue: {
                        $sum: {
                            $subtract: [
                                { $ifNull: ["$items.subtotal", { $multiply: ["$items.price", "$items.quantity"] }] },
                                {
                                    $multiply: [
                                        { $ifNull: ["$refundedAmount", 0] },
                                        {
                                            $divide: [
                                                { $ifNull: ["$items.subtotal", { $multiply: ["$items.price", "$items.quantity"] }] },
                                                { $ifNull: ["$subtotal", 1] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    orders: { $addToSet: "$_id" }
                }
            },
            {
                $project: {
                    date: "$_id",
                    revenue: 1,
                    orderCount: { $size: "$orders" },
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        // 2. Top Products
        const topProducts = await Order.aggregate([
            {
                $match: {
                    'items.vendor': vendorId,
                    paymentStatus: { $in: ['paid', 'partially_refunded'] }
                }
            },
            { $unwind: '$items' },
            {
                $match: { 'items.vendor': vendorId }
            },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    totalSales: { $sum: { $ifNull: ["$items.subtotal", { $multiply: ["$items.price", "$items.quantity"] }] } },
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
        ]);

        // 3. Overall Stats
        const overallStats = await Vendor.findOne({ owner: req.user._id })
            .select('totalSales totalOrders balance');

        res.status(200).json({
            success: true,
            data: {
                revenueTrend,
                topProducts,
                overallStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

/**
 * Get platform-wide analytics (Admin)
 * @route GET /api/analytics/admin
 * @access Private (Admin)
 */
export const getAdminAnalytics = async (req, res) => {
    try {
        // 1. Total Platform GMV, Commission, and Order Count
        const platformStatsAgg = await Order.aggregate([
            { $match: { paymentStatus: { $in: ['paid', 'partially_refunded'] } } },
            {
                $group: {
                    _id: null,
                    totalGMV: { $sum: { $subtract: ["$total", { $ifNull: ["$refundedAmount", 0] }] } },
                    totalOrders: { $count: {} },
                    totalCommission: { $sum: { $multiply: [{ $subtract: ["$total", { $ifNull: ["$refundedAmount", 0] }] }, 0.10] } }
                }
            }
        ]);

        const stats = platformStatsAgg[0] || { totalGMV: 0, totalOrders: 0, totalCommission: 0 };

        // 2. Payout Stats
        const payoutStatsAgg = await Payout.aggregate([
            {
                $group: {
                    _id: "$status",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const payoutTotals = {
            pending: 0,
            processed: 0,
            failed: 0
        };
        payoutStatsAgg.forEach(stat => {
            if (payoutTotals.hasOwnProperty(stat._id)) {
                payoutTotals[stat._id] = stat.total;
            }
        });

        // Calculate Net GMV (Deducting processed payouts as requested)
        const netGMV = stats.totalGMV - payoutTotals.processed;

        // 3. Revenue Trend (Platform Wide)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const globalTrend = await Order.aggregate([
            {
                $match: {
                    paymentStatus: { $in: ['paid', 'partially_refunded'] },
                    paidAt: { $gte: ninetyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                    revenue: { $sum: { $subtract: ["$total", { $ifNull: ["$refundedAmount", 0] }] } },
                    commission: { $sum: { $multiply: [{ $subtract: ["$total", { $ifNull: ["$refundedAmount", 0] }] }, 0.10] } },
                    count: { $count: {} }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Top Vendors
        const topVendors = await Vendor.find()
            .sort({ totalSales: -1 })
            .limit(10)
            .populate('owner', 'name email');

        res.status(200).json({
            success: true,
            data: {
                platformStats: {
                    ...stats,
                    netGMV
                },
                payouts: payoutTotals,
                globalTrend,
                topVendors
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
