import Order from '../../models/Order.model.js';
import User from '../../models/User.model.js';
import Vendor from '../../models/Vendor.js';
import { sendOrderConfirmationEmail } from './email.helper.js';

/**
 * Finalize an order after successful payment verification (from UI or Webhook)
 */
export const finalizeOrder = async (orderId, reference) => {
    // 1. Update Order Status (Atomic check for paymentStatus)
    const updateTime = new Date();
    const order = await Order.findOneAndUpdate(
        { _id: orderId, paymentStatus: { $ne: 'paid' } },
        {
            $set: {
                paymentStatus: 'paid',
                paidAt: updateTime,
                orderStatus: 'processing',
                paymentReference: reference || undefined
            }
        },
        { new: true }
    ).populate('customer', 'name email');

    if (!order) {
        // Order either doesn't exist or is already marked as paid
        return await Order.findById(orderId).populate('customer', 'name email');
    }

    // 2. Update Vendor Statistics (Atomic Upsert)
    try {
        const COMMISSION_RATE = 0.10; // 10% platform commission
        const vendorUpdates = {};

        order.items.forEach(item => {
            const vId = item.vendor?.toString();
            if (vId) {
                if (!vendorUpdates[vId]) vendorUpdates[vId] = { sales: 0, vendorShare: 0, orders: 1 };
                const amount = item.subtotal || (item.price * item.quantity);
                vendorUpdates[vId].sales += amount;

                // Calculate vendor share (90% of subtotal)
                const share = amount * (1 - COMMISSION_RATE);
                vendorUpdates[vId].vendorShare += share;
            }
        });

        for (const [vOwnerId, data] of Object.entries(vendorUpdates)) {
            const ownerUser = await User.findById(vOwnerId);
            const storeName = ownerUser ? `${ownerUser.name}'s Store` : `Vendor ${vOwnerId}`;

            await Vendor.findOneAndUpdate(
                { owner: vOwnerId },
                {
                    $inc: {
                        totalSales: data.sales,
                        totalOrders: data.orders,
                        balance: data.vendorShare
                    },
                    $setOnInsert: { storeName, isApproved: false, isActive: true }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }
    } catch (vErr) {
        console.error('Vendor stats update failed in finalizeOrder:', vErr);
    }

    // 3. Send Emails
    try {
        await sendOrderConfirmationEmail(order, order.customer);
    } catch (eErr) {
        console.error('Failed to send order confirmation email:', eErr);
    }

    return order;
};
