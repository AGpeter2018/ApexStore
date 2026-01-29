import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders, selectOrders, selectOrderLoading, selectOrderPagination } from '../../redux/slices/orderSlice';
import { Package, Search, Filter } from 'lucide-react';

const MyOrdersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const orders = useSelector(selectOrders);
    const loading = useSelector(selectOrderLoading);
    const pagination = useSelector(selectOrderPagination);

    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchMyOrders({ page, limit: 10, status: statusFilter }));
    }, [dispatch, statusFilter, page]);

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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="my-orders-page">
            <div className="orders-container">
                <h1>My Orders</h1>

                <div className="orders-header">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by order number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        <Filter size={20} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (          
           <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={80} />
                        <h2>No orders found</h2>
                        <p>You haven't placed any orders yet.</p>
                        <button onClick={() => navigate('/categories')} className="shop-btn">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className="order-card"
                                onClick={() => navigate(`/my-orders/${order._id}`)}
                            >
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>{order.orderNumber}</h3>
                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="order-status">
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                                        >
                                            {order.orderStatus?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.items?.slice(0, 3).map((item, index) => (
                                        <div key={index} className="order-item-preview">
                                            <img src={item.image} alt={item.name} />
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <span className="more-items">+{order.items.length - 3} more</span>
                                    )}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <span>Total:</span>
                                        <strong>₦{order.total?.toLocaleString()}</strong>
                                    </div>
                                    <div className="payment-status">
                                        <span className={`payment-badge ${order.paymentStatus}`}>
                                            {order.paymentStatus?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="page-btn"
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {page} of {pagination.pages}
                                </span>
                                <button
                                    disabled={page === pagination.pages}
                                    onClick={() => setPage(page + 1)}
                                    className="page-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .my-orders-page {
                    min-height: 80vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 40px 20px;
                }

                .orders-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .orders-container h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 30px;
                }

                .orders-header {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .search-box,
                .filter-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .search-box {
                    flex: 1;
                }

                .search-box input,
                .filter-box select {
                    border: none;
                    outline: none;
                    font-size: 16px;
                    flex: 1;
                }

                .filter-box select {
                    cursor: pointer;
                }

                .orders-list {
                    display: grid;
                    gap: 20px;
                }

                .order-card {
                    background: white;
                    padding: 25px;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .order-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }

                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #f0f0f0;
                }

                .order-info h3 {
                    font-size: 20px;
                    color: #333;
                    margin: 0 0 5px 0;
                }

                .order-date {
                    color: #666;
                    font-size: 14px;
                    margin: 0;
                }

                .status-badge {
                    padding: 8px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 12px;
                    font-weight: 700;
                }

                .order-items {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .order-item-preview {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }

                .order-item-preview img {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 6px;
                }

                .order-item-preview span {
                    font-size: 14px;
                    color: #666;
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .more-items {
                    padding: 10px 15px;
                    background: #667eea;
                    color: white;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .order-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .order-total {
                    display: flex;
                    gap: 10px;
                    font-size: 18px;
                    color: #666;
                }

                .order-total strong {
                    color: #667eea;
                    font-size: 20px;
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

                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 16px;
                }

                .empty-state svg {
                    color: #ddd;
                    margin-bottom: 20px;
                }

                .empty-state h2 {
                    font-size: 28px;
                    color: #333;
                    margin: 20px 0 10px 0;
                }

                .empty-state p {
                    color: #666;
                    margin-bottom: 30px;
                }

                .shop-btn {
                    padding: 14px 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .shop-btn:hover {
                    transform: translateY(-2px);
                }

                .loading {
                    text-align: center;
                    padding: 100px 20px;
                    font-size: 20px;
                    color: #667eea;
                }
 
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-top: 30px;
                }
 
                .page-btn {
                    padding: 10px 20px;
                    background: white;
                    border: 2px solid #667eea;
                    color: #667eea;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
 
                .page-btn:hover:not(:disabled) {
                    background: #667eea;
                    color: white;
                }
 
                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
 
                .page-info {
                    font-weight: 600;
                    color: #333;
                }

                @media (max-width: 768px) {
                    .orders-header {
                        flex-direction: column;
                    }

                    .order-header {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .order-footer {
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyOrdersPage;
