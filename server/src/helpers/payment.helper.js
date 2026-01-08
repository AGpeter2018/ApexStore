import axios from 'axios';

// Paystack Configuration
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Flutterwave Configuration
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

// Ensure no trailing slash
const RAW_FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const FRONTEND_URL = RAW_FRONTEND_URL.endsWith('/') ? RAW_FRONTEND_URL.slice(0, -1) : RAW_FRONTEND_URL;

/**
 * Initialize Paystack payment
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment initialization response
 */
export const initializePaystackPayment = async (paymentData) => {
    try {
        const { email, amount, orderId, metadata } = paymentData;

        const payload = {
            email,
            amount: Math.round(amount * 100), // Ensure integer kobo
            reference: `ORD-${orderId}-${Date.now()}`,
            callback_url: `${FRONTEND_URL}/payment/verify`,
            metadata: {
                orderId,
                ...metadata
            }
        };

        console.log('🚀 Initializing Paystack Payment with payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            data: response.data.data,
            authorizationUrl: response.data.data.authorization_url,
            accessCode: response.data.data.access_code,
            reference: response.data.data.reference
        };
    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Payment initialization failed'
        };
    }
};

/**
 * Verify Paystack payment
 * @param {String} reference - Payment reference
 * @returns {Object} Verification response
 */
export const verifyPaystackPayment = async (reference) => {
    try {
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const { data } = response.data;

        return {
            success: data.status === 'success',
            status: data.status,
            amount: data.amount / 100, // Convert from kobo
            reference: data.reference,
            paidAt: data.paid_at,
            metadata: data.metadata
        };
    } catch (error) {
        console.error('Paystack verification error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Payment verification failed'
        };
    }
};

/**
 * Initialize Flutterwave payment
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment initialization response
 */
export const initializeFlutterwavePayment = async (paymentData) => {
    try {
        const { email, amount, orderId, customerName, metadata } = paymentData;

        const response = await axios.post(
            `${FLUTTERWAVE_BASE_URL}/payments`,
            {
                tx_ref: `ORD-${orderId}-${Date.now()}`,
                amount,
                currency: 'NGN',
                redirect_url: `${FRONTEND_URL}/payment/verify`,
                payment_options: 'card,banktransfer,ussd',
                customer: {
                    email,
                    name: customerName
                },
                customizations: {
                    title: 'ApexStore',
                    description: `Payment for order ${orderId}`,
                    logo: `${process.env.CLIENT_URL}/logo.png`
                },
                meta: {
                    orderId,
                    ...metadata
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            data: response.data.data,
            paymentLink: response.data.data.link,
            reference: response.data.data.tx_ref
        };
    } catch (error) {
        console.error('Flutterwave initialization error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Payment initialization failed'
        };
    }
};

/**
 * Verify Flutterwave payment
 * @param {String} transactionId - Transaction ID
 * @returns {Object} Verification response
 */
export const verifyFlutterwavePayment = async (transactionId) => {
    try {
        const response = await axios.get(
            `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
                }
            }
        );

        const { data } = response.data;

        return {
            success: data.status === 'successful',
            status: data.status,
            amount: data.amount,
            reference: data.tx_ref,
            paidAt: data.created_at,
            metadata: data.meta
        };
    } catch (error) {
        console.error('Flutterwave verification error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Payment verification failed'
        };
    }
};

/**
 * Process payment based on payment method
 * @param {String} paymentMethod - Payment method (paystack, flutterwave, cash_on_delivery)
 * @param {Object} paymentData - Payment details
 * @returns {Object} Payment processing response
 */
export const processPayment = async (paymentMethod, paymentData) => {
    switch (paymentMethod) {
        case 'paystack':
            return await initializePaystackPayment(paymentData);

        case 'flutterwave':
            return await initializeFlutterwavePayment(paymentData);

        case 'cash_on_delivery':
            return {
                success: true,
                message: 'Cash on delivery selected',
                paymentStatus: 'pending'
            };

        default:
            return {
                success: false,
                error: 'Invalid payment method'
            };
    }
};

/**
 * Verify payment based on payment method
 * @param {String} paymentMethod - Payment method
 * @param {String} reference - Payment reference or transaction ID
 * @returns {Object} Verification response
 */
export const verifyPayment = async (paymentMethod, reference) => {
    switch (paymentMethod) {
        case 'paystack':
            return await verifyPaystackPayment(reference);

        case 'flutterwave':
            return await verifyFlutterwavePayment(reference);

        case 'cash_on_delivery':
            return {
                success: true,
                status: 'pending',
                message: 'Cash on delivery - no verification needed'
            };

        default:
            return {
                success: false,
                error: 'Invalid payment method'
            };
    }
};
/**
 * Refund Paystack payment
 * @param {String} reference - Transaction reference
 * @param {Number} amount - Amount to refund (optional, defaults to full)
 * @returns {Object} Refund response
 */
export const refundPaystackPayment = async (reference, amount) => {
    try {
        const payload = { transaction: reference };
        if (amount) payload.amount = Math.round(amount * 100);

        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/refund`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Paystack refund error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Refund failed' };
    }
};

/**
 * Refund Flutterwave payment
 * @param {String} transactionId - Transaction ID
 * @param {Number} amount - Amount to refund
 * @returns {Object} Refund response
 */
export const refundFlutterwavePayment = async (transactionId, amount) => {
    try {
        const payload = {};
        if (amount) payload.amount = amount;

        const response = await axios.post(
            `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/refund`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { success: true, data: response.data.data };
    } catch (error) {
        console.error('Flutterwave refund error:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Refund failed' };
    }
};

/**
 * Unified refund helper
 */
export const refundPayment = async (paymentMethod, reference, amount) => {
    switch (paymentMethod) {
        case 'paystack':
            return await refundPaystackPayment(reference, amount);
        case 'flutterwave':
            return await refundFlutterwavePayment(reference, amount);
        default:
            return { success: false, error: 'Refund not supported for this method' };
    }
};
