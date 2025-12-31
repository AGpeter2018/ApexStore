import crypto from 'crypto';
import { finalizeOrder } from '../helpers/order.helper.js';

/**
 * Handle Paystack Webhook
 */
export const handlePaystackWebhook = async (req, res) => {
    try {
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).send('Invalid signature');
        }

        const event = req.body;
        console.log('📬 Paystack Webhook received:', event.event);

        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            const orderId = metadata?.orderId;

            if (orderId) {
                await finalizeOrder(orderId, reference);
            }
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        console.error('Paystack webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Handle Flutterwave Webhook
 */
export const handleFlutterwaveWebhook = async (req, res) => {
    try {
        const signature = req.headers['verif-hash'];
        if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
            return res.status(401).send('Invalid signature');
        }

        const event = req.body;
        console.log('📬 Flutterwave Webhook received:', event.event);

        if (event.event === 'charge.completed' && event.data.status === 'successful') {
            const { tx_ref, meta } = event.data;
            const orderId = meta?.orderId;

            if (orderId) {
                await finalizeOrder(orderId, tx_ref);
            }
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        console.error('Flutterwave webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
};

