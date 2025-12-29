import {useEffect} from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderById, selectCurrentOrder, selectOrderLoading, verifyPayment } from '../redux/slices/orderSlice';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';

const OrderConfirmationPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const order = useSelector(selectCurrentOrder);
    const loading = useSelector(selectOrderLoading);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const reference = queryParams.get('reference'); // Paystack
        const trxref = queryParams.get('trxref'); // Paystack alternate
        const transactionId = queryParams.get('transaction_id'); // Flutterwave

        // DEBUG LOGGING
        console.log('OrderConfirmationPage Mounted');
        console.log('URL Params:', { reference, trxref, transactionId });
        console.log('OrderId from Params:', orderId);

        const paymentRef = reference || trxref || transactionId;

        const handleVerification = async () => {
            if (!orderId) {
                console.warn('No order ID found in URL params');
                return;
            }

            console.log('Starting verification check for order:', orderId);

            try {
                // If we have a payment reference, triggers verification immediately
                // The backend handles idempotency (if already paid, it returns success or ignores)
                if (paymentRef) {
                    console.log('Payment reference found, attempting verification:', paymentRef);
                    const result = await dispatch(verifyPayment({
                        orderId,
                        paymentData: {
                            reference: reference || trxref,
                            transactionId: transactionId
                        }
                    })).unwrap();
                    console.log('Verification successful:', result);

                    // After verification, refresh order data
                    console.log('Refreshing order data...');
                    await dispatch(fetchOrderById(orderId)).unwrap();
                } else {
                    console.log('No payment reference found, fetching order details only...');
                    // Just fetch the order if no verification needed
                    await dispatch(fetchOrderById(orderId)).unwrap();
                }
            } catch (error) {
                console.error('Verification/Fetch error:', error);

                // Even if verification fails, try to fetch the order to show current status
                try {
                    console.log('Attempting fallback fetch after error...');
                    await dispatch(fetchOrderById(orderId)).unwrap();
                } catch (fetchError) {
                    console.error('Final fetch error:', fetchError);
                }
            }
        };

        handleVerification();
    }, [orderId, location.search, dispatch]);

    if (loading) {
        return (
            <div className="confirmation-page">
                <div className="loading">Loading order details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="confirmation-page">
                <div className="error">Order not found</div>
            </div>
        );
    }

    return (
        <div className="confirmation-page">
            <div className="confirmation-container">
                <div className="success-header">
                    <CheckCircle size={80} className="success-icon" />
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your purchase. Your order has been received and is being processed.</p>
                    <div className="order-number">
                        Order Number: <strong>{order.orderNumber}</strong>
                    </div>
                </div>

                <div className="order-details-grid">
                    <div className="detail-card">
                        <div className="card-header">
                            <Package size={24} />
                            <h3>Order Items</h3>
                        </div>
                        <div className="items-list">
                            {order.items?.map((item) => (
                                <div key={item._id} className="order-item">
                                    <img src={item.image} alt={item.name} />
                                    <div className="item-info">
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-quantity">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="item-price">₦{item.subtotal?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal:</span>
                                <span>₦{order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping:</span>
                                <span>₦{order.shippingFee?.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Tax:</span>
                                <span>₦{order.tax?.toLocaleString()}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total:</span>
                                <span>₦{order.total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-card">
                        <div className="card-header">
                            <MapPin size={24} />
                            <h3>Shipping Address</h3>
                        </div>
                        <div className="address-info">
                            <p>{order.shippingAddress?.name}</p>
                            <p>{order.shippingAddress?.phone}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                            <p>{order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    <div className="detail-card">
                        <div className="card-header">
                            <CreditCard size={24} />
                            <h3>Payment Information</h3>
                        </div>
                        <div className="payment-info">
                            <div className="info-row">
                                <span>Payment Method:</span>
                                <strong>{order.paymentMethod?.replace('_', ' ').toUpperCase()}</strong>
                            </div>
                            <div className="info-row">
                                <span>Payment Status:</span>
                                <span className={`status-badge ${order.paymentStatus}`}>
                                    {order.paymentStatus?.toUpperCase()}
                                </span>
                            </div>
                            <div className="info-row">
                                <span>Order Status:</span>
                                <span className={`status-badge ${order.orderStatus}`}>
                                    {order.orderStatus?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="action-buttons" style={{ flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                    {/* MANUAL VERIFICATION FALBACK - SHOW IF NOT PAID */}
                    {order.paymentStatus !== 'paid' && order.paymentMethod !== 'cash_on_delivery' && (
                        <div className="verification-warning" style={{
                            padding: '20px',
                            background: '#fff3cd',
                            border: '1px solid #ffeeba',
                            borderRadius: '12px',
                            color: '#856404',
                            maxWidth: '600px',
                            width: '100%',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Payment Status: Pending</h4>
                            <p style={{ margin: '0 0 15px 0' }}>
                                If you have already completed the payment, please click the button below to update your order status.
                            </p>
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(location.search);
                                    const paymentData = {
                                        reference: params.get('reference') || params.get('trxref'),
                                        transactionId: params.get('transaction_id')
                                    };

                                    console.log('Manual verify clicked', paymentData);

                                    dispatch(verifyPayment({
                                        orderId,
                                        paymentData
                                    })).unwrap().then(() => {
                                        dispatch(fetchOrderById(orderId));
                                        alert('Payment verified successfully!');
                                    }).catch((err) => {
                                        alert('Verification failed: ' + (err.message || 'Unknown error'));
                                    });
                                }}
                                className="btn-primary"
                                style={{ background: '#856404', border: 'none', margin: '0 auto' }}
                            >
                                Verify Payment Now
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/my-orders')} className="btn-primary">
                            View All Orders
                            <ArrowRight size={20} />
                        </button>
                        <button onClick={() => navigate('/categories')} className="btn-secondary">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>

            {/* DEBUG SECTION */}
            <div style={{ marginTop: '50px', padding: '20px', background: '#f0f0f0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
                <h4>DEBUG INFO (Share this if you have issues)</h4>
                <p><strong>Order ID:</strong> {orderId}</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                <p><strong>URL Params:</strong> {location.search}</p>
                <details>
                    <summary>Full Order Object</summary>
                    <pre>{JSON.stringify(order, null, 2)}</pre>
                </details>
            </div>


            <style jsx>{`
                .confirmation-page {
                    min-height: 80vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 40px 20px;
                }

                .confirmation-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .success-header {
                    text-align: center;
                    background: white;
                    padding: 50px 30px;
                    border-radius: 16px;
                    margin-bottom: 30px;
                }

                .success-icon {
                    color: #4CAF50;
                    margin-bottom: 20px;
                }

                .success-header h1 {
                    font-size: 32px;
                    color: #333;
                    margin-bottom: 10px;
                }

                .success-header p {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 20px;
                }

                .order-number {
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 25px;
                    font-size: 16px;
                }

                .order-details-grid {
                    display: grid;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .detail-card {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    color: #667eea;
                }

                .card-header h3 {
                    font-size: 20px;
                    color: #333;
                    margin: 0;
                }

                .items-list {
                    margin-bottom: 20px;
                }

                .order-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: 12px;
                    margin-bottom: 10px;
                }

                .order-item img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .item-info {
                    flex: 1;
                }

                .item-name {
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 5px 0;
                }

                .item-quantity {
                    color: #666;
                    font-size: 14px;
                    margin: 0;
                }

                .item-price {
                    font-weight: 700;
                    color: #667eea;
                    margin: 0;
                }

                .order-totals {
                    border-top: 2px solid #e0e0e0;
                    padding-top: 15px;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 16px;
                    color: #666;
                }

                .total-row.grand-total {
                    font-size: 20px;
                    font-weight: 700;
                    color: #333;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #667eea;
                }

                .address-info p {
                    margin: 8px 0;
                    color: #666;
                    line-height: 1.6;
                }

                .payment-info {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }

                .status-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .status-badge.pending {
                    background: #fff3cd;
                    color: #856404;
                }

                .status-badge.paid,
                .status-badge.processing {
                    background: #d4edda;
                    color: #155724;
                }

                .status-badge.failed {
                    background: #f8d7da;
                    color: #721c24;
                }

                .action-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }

                .btn-primary,
                .btn-secondary {
                    padding: 14px 30px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .btn-secondary {
                    background: white;
                    color: #667eea;
                    border: 2px solid #667eea;
                }

                .btn-secondary:hover {
                    background: #f5f7ff;
                }

                .loading,
                .error {
                    text-align: center;
                    padding: 100px 20px;
                    font-size: 20px;
                    color: #667eea;
                }

                @media (max-width: 768px) {
                    .action-buttons {
                        flex-direction: column;
                    }

                    .btn-primary,
                    .btn-secondary {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div >
    );
};

export default OrderConfirmationPage;
