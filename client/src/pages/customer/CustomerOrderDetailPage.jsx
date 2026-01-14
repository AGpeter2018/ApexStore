import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { orderAPI } from '../../utils/api';
import { fetchOrderById, selectCurrentOrder, selectOrderLoading } from '../../redux/slices/orderSlice';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Calendar } from 'lucide-react';

const CustomerOrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const order = useSelector(selectCurrentOrder);
    const loading = useSelector(selectOrderLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
    }, [id, dispatch]);

    const handleCancelOrder = async (isRefund = false) => {
        const action = isRefund ? 'request a refund for' : 'cancel';
        const reason = window.prompt(`Please provide a reason to ${action} this order:`);

        if (reason !== null) { // User didn't click Cancel
            if (window.confirm(`Are you sure you want to ${action} this order?`)) {
                try {
                    await orderAPI.cancelOrder(id, { reason });
                    alert(`Order ${isRefund ? 'refund requested' : 'cancelled'} successfully`);
                    // Refresh order logic by re-fetching
                    dispatch(fetchOrderById(id));
                } catch (error) {
                    console.error('Cancel error:', error);
                    alert(error.response?.data?.message || 'Failed to cancel order');
                }
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            processing: '#2196F3',
            shipped: '#9c27b0',
            delivered: '#4CAF50',
            cancelled: '#f44336'
        };
        return colors[status] || '#999';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderTimeline = () => {
        const timeline = [
            { status: 'pending', label: 'Order Placed', date: order?.createdAt, icon: Package },
            { status: 'processing', label: 'Processing', date: order?.orderStatus === 'processing' ? order?.updatedAt : null, icon: Package },
            { status: 'shipped', label: 'Shipped', date: order?.orderStatus === 'shipped' ? order?.updatedAt : null, icon: Truck },
            { status: 'delivered', label: 'Delivered', date: order?.deliveredAt, icon: Package }
        ];

        const currentIndex = timeline.findIndex(t => t.status === order?.orderStatus);

        return timeline.map((item, index) => ({
            ...item,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="order-detail-page">
                <div className="loading">Loading order details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-page">
                <div className="error">Order not found</div>
            </div>
        );
    }

    const timeline = getOrderTimeline();

    return (
        <div className="order-detail-page">
            <div className="detail-container">
                <button onClick={() => navigate('/my-orders')} className="back-btn">
                    <ArrowLeft size={20} />
                    Back to Orders
                </button>

                <div className="order-header">
                    <div>
                        <h1>Order Details</h1>
                        <p className="order-number">Order #{order.orderNumber}</p>
                    </div>
                    <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                        {order.orderStatus?.toUpperCase()}
                    </span>
                    {/* Cancel Order: Only for non-shipped orders */}
                    {['pending', 'processing'].includes(order.orderStatus) && (
                        <button
                            onClick={() => handleCancelOrder(false)}
                            className="delete-order-btn"
                        >
                            Cancel Order
                        </button>
                    )}

                    {/* Report a Problem: For shipped or delivered orders */}
                    {['shipped', 'delivered'].includes(order.orderStatus) && (
                        <button
                            onClick={() => navigate(`/customer/disputes/open/${order._id}`)}
                            className="delete-order-btn"
                            style={{ backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}
                        >
                            Report a Problem / Refund
                        </button>
                    )}
                </div>

                {/* Order Timeline */}
                <div className="timeline-card">
                    <h2>Order Timeline</h2>
                    <div className="timeline">
                        {timeline.map((item, index) => (
                            <div key={index} className={`timeline-item ${item.completed ? 'completed' : ''} ${item.active ? 'active' : ''}`}>
                                <div className="timeline-icon">
                                    <item.icon size={20} />
                                </div>
                                <div className="timeline-content">
                                    <p className="timeline-label">{item.label}</p>
                                    {item.date && (
                                        <p className="timeline-date">{formatDate(item.date)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {order.trackingNumber && (
                        <div className="tracking-info">
                            <Truck size={20} />
                            <span>Tracking Number: <strong>{order.trackingNumber}</strong></span>
                        </div>
                    )}
                </div>

                <div className="details-grid">
                    {/* Order Items */}
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
                                        <p className="item-price">₦{item.price?.toLocaleString()} each</p>
                                    </div>
                                    <p className="item-subtotal">₦{item.subtotal?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal:</span>
                                <span>₦{order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping Fee:</span>
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

                    {/* Shipping Address */}
                    <div className="detail-card">
                        <div className="card-header">
                            <MapPin size={24} />
                            <h3>Shipping Address</h3>
                        </div>
                        <div className="address-info">
                            <p><strong>{order.shippingAddress?.name}</strong></p>
                            <p>{order.shippingAddress?.phone}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                            <p>{order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    {/* Payment Information */}
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
                                <span className={`payment-badge ${order.paymentStatus}`}>
                                    {order.paymentStatus?.toUpperCase()}
                                </span>
                            </div>
                            {order.paidAt && (
                                <div className="info-row">
                                    <span>Paid At:</span>
                                    <span>{formatDate(order.paidAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Dates */}
                    <div className="detail-card">
                        <div className="card-header">
                            <Calendar size={24} />
                            <h3>Important Dates</h3>
                        </div>
                        <div className="dates-info">
                            <div className="info-row">
                                <span>Order Placed:</span>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="info-row">
                                <span>Last Updated:</span>
                                <span>{formatDate(order.updatedAt)}</span>
                            </div>
                            {order.deliveredAt && (
                                <div className="info-row">
                                    <span>Delivered:</span>
                                    <span>{formatDate(order.deliveredAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {order.notes && (
                    <div className="notes-card">
                        <h3>Order Notes</h3>
                        <p>{order.notes}</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .order-detail-page {
                    min-height: 80vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 40px 20px;
                }

                .detail-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 2px solid #667eea;
                    color: #667eea;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 20px;
                    transition: all 0.2s;
                }

                .back-btn:hover {
                    background: #f5f7ff;
                }

                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    margin-bottom: 20px;
                }

                .order-header h1 {
                    font-size: 32px;
                    color: #333;
                    margin: 0 0 5px 0;
                }

                .order-number {
                    color: #666;
                    font-size: 16px;
                    margin: 0;
                }

                .status-badge {
                    padding: 10px 20px;
                    border-radius: 25px;
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                }

                .delete-order-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    background: #fee2e2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: 15px;
                }

                .delete-order-btn:hover {
                    background: #fecaca;
                }

                .timeline-card {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    margin-bottom: 20px;
                }

                .timeline-card h2 {
                    font-size: 24px;
                    margin-bottom: 25px;
                    color: #333;
                }

                .timeline {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    margin-bottom: 20px;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    top: 25px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #e0e0e0;
                    z-index: 0;
                }

                .timeline-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    z-index: 1;
                    flex: 1;
                }

                .timeline-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    border: 3px solid white;
                }

                .timeline-item.completed .timeline-icon {
                    background: #4CAF50;
                    color: white;
                }

                .timeline-item.active .timeline-icon {
                    background: #667eea;
                    color: white;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
                }

                .timeline-content {
                    text-align: center;
                }

                .timeline-label {
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 5px 0;
                }

                .timeline-date {
                    font-size: 12px;
                    color: #666;
                    margin: 0;
                }

                .tracking-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background: #f5f7ff;
                    border-radius: 10px;
                    color: #667eea;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .detail-card {
                    background: white;
                    padding: 25px;
                    border-radius: 16px;
                }

                .detail-card:first-child {
                    grid-column: 1 / -1;
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
                    width: 80px;
                    height: 80px;
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

                .item-quantity,
                .item-price {
                    color: #666;
                    font-size: 14px;
                    margin: 3px 0;
                }

                .item-subtotal {
                    font-weight: 700;
                    color: #667eea;
                    font-size: 18px;
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
                    font-size: 22px;
                    font-weight: 700;
                    color: #333;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #667eea;
                }

                .address-info p,
                .dates-info p {
                    margin: 8px 0;
                    color: #666;
                    line-height: 1.6;
                }

                .payment-info,
                .dates-info {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }

                .payment-badge {
                    padding: 6px 12px;
                    border-radius: 15px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .payment-badge.pending {
                    background: #fff3cd;
                    color: #856404;
                }

                .payment-badge.paid {
                    background: #d4edda;
                    color: #155724;
                }

                .payment-badge.failed {
                    background: #f8d7da;
                    color: #721c24;
                }

                .notes-card {
                    background: white;
                    padding: 25px;
                    border-radius: 16px;
                }

                .notes-card h3 {
                    font-size: 20px;
                    margin-bottom: 15px;
                    color: #333;
                }

                .notes-card p {
                    color: #666;
                    line-height: 1.6;
                }

                .loading,
                .error {
                    text-align: center;
                    padding: 100px 20px;
                    font-size: 20px;
                    color: #667eea;
                }

                @media (max-width: 968px) {
                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .detail-card:first-child {
                        grid-column: 1;
                    }

                    .timeline {
                        flex-direction: column;
                        gap: 20px;
                    }

                    .timeline::before {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerOrderDetailPage;
