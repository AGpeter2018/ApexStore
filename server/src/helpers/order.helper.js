import Order from '../../models/Order.model.js';
import User from '../../models/User.model.js';
import Vendor from '../../models/Vendor.js';
import { sendOrderConfirmationEmail } from './email.helper.js';

/**
 * Finalize an order after successful payment verification (from UI or Webhook)
 */
export const finalizeOrder = async (orderId, reference) => {
    const order = await Order.findById(orderId).populate('customer', 'name email');
    if (!order || order.paymentStatus === 'paid') return order;

    // 1. Update Order Status
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.orderStatus = 'processing';
    if (reference) order.paymentReference = reference;
    await order.save();

    // 2. Update Vendor Statistics (Atomic Upsert)
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
