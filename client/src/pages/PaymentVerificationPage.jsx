import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

const PaymentVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            // Get payment reference from URL
            // Paystack: ?reference=xxx
            // Flutterwave: ?tx_ref=xxx&transaction_id=xxx
            const reference = searchParams.get('reference') ||
                searchParams.get('trxref') ||
                searchParams.get('tx_ref') ||
                searchParams.get('transaction_id');

            const orderId = searchParams.get('orderId') ||
                localStorage.getItem('pendingOrderId');

            if (!reference || !orderId) {
                throw new Error('Invalid payment reference or order ID');
            }

            // USE CENTRALIZED API
            const { data } = await orderAPI.verifyPayment(orderId, {
                reference,
                transactionId: reference
            });

            if (data.success) {
                setStatus('success');
                setMessage('Payment verified successfully!');
                localStorage.removeItem('pendingOrderId');

                setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Verification error:', error);
            const errorMsg = error.response?.data?.message || error.message;
            setStatus('failed');
            setMessage(errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                {status === 'verifying' && (
                    <>
                        <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
                        <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="mx-auto text-red-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-orange-600 text-white rounded-lg"
                        >
                            Try Again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentVerificationPage;