import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../utils/api';
import { ArrowLeft, Package, MapPin, AlertCircle, Trash2, RefreshCcw, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateData, setUpdateData] = useState({
        orderStatus: '',
        trackingNumber: '',
        notes: ''
    });

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        setError('');

        try {
            const { data } = await orderAPI.getOrderById(id);

            setOrder(data.data);
            setUpdateData({
                orderStatus: data.data.orderStatus,
                trackingNumber: data.data.trackingNumber || '',
                notes: data.data.notes || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);

            if (error.response?.status === 401) {
                setError('Unauthorized. Please login again.');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to view this order.');
            } else if (error.response?.status === 404) {
                setError('Order not found.');
            } else {
                setError(error.response?.data?.message || 'Failed to fetch order');
            }
            setLoading(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (window.confirm('Are you sure you want to delete this order as an Admin? This action cannot be undone.')) {
            try {
                await orderAPI.deleteOrder(id);
                alert('Order deleted successfully');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                navigate(`/${user.role}/orders`);
            } catch (error) {
                console.error('Delete error:', error);
                alert(error.response?.data?.message || 'Failed to delete order');
            }
        }
    };


    const handleRefundOrder = async () => {
        const amount = prompt('Enter refund amount (optional, leave blank for full refund):');
        const reason = prompt('Enter refund reason:');

        if (window.confirm(`Are you sure you want to refund ${amount || 'the full amount'}?`)) {
            try {
                await orderAPI.refundOrder(id, { amount: amount ? parseFloat(amount) : undefined, reason });
                alert('Refund initiated successfully');
                fetchOrder();
            } catch (error) {
                console.error('Refund error:', error);
                alert(error.response?.data?.message || 'Failed to initiate refund');
            }
        }
    };

    const handleConfirmPayment = async () => {
        if (window.confirm('Are you sure you want to mark this COD order as PAID? This will update vendor balances and commissions.')) {
            try {
                await orderAPI.confirmCODPayment(id);
                alert('Payment confirmed and vendor balances updated!');
                fetchOrder();
            } catch (error) {
                console.error('Confirm payment error:', error);
                alert(error.response?.data?.message || 'Failed to confirm payment');
            }
        }
    };

    const handleUpdateOrder = async () => {
        setUpdating(true);
        try {
            await orderAPI.updateOrderStatus(id, updateData);
            alert('Order updated successfully!');
            fetchOrder();
        } catch (error) {
            console.error('Update error:', error);
            alert(error.response?.data?.message || 'Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-bold">Error Loading Order</p>
                            <p>{error}</p>
                            <button
                                onClick={fetchOrder}
                                className="mt-3 text-sm underline hover:no-underline"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                        Order not found
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Order {order.orderNumber}</h1>
                            <p className="text-gray-600 mt-2">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-3xl font-bold text-gray-900 border-b border-dashed border-gray-100 pb-1 mb-1">{formatPrice(order.total)}</p>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Share</p>
                                    <p className="text-lg font-bold text-orange-600">
                                        {formatPrice(
                                            order.items.reduce((sum, item) => {
                                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                const itemAmount = item.subtotal || (item.price * item.quantity);
                                                if (user.role === 'admin') {
                                                    return sum + (itemAmount * 0.10);
                                                } else {
                                                    // Backend already filters items for vendors, so we just sum 90%
                                                    return sum + (itemAmount * 0.90);
                                                }
                                            }, 0)
                                        )}
                                    </p>
                                </div>
                            </div>
                            {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                                <div className="flex gap-2">
                                    {order.paymentMethod === 'cash_on_delivery' && order.paymentStatus === 'pending' && (
                                        <button
                                            onClick={handleConfirmPayment}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold"
                                        >
                                            <CheckCircle size={16} />
                                            Confirm Payment
                                        </button>
                                    )}
                                    <button
                                        onClick={handleRefundOrder}
                                        disabled={order.paymentStatus !== 'paid'}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCcw size={16} />
                                        Refund
                                    </button>
                                    <button
                                        onClick={handleDeleteOrder}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>
                            <div className="space-y-4">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            <img
                                                src={item.image || 'https://via.placeholder.com/80'}
                                                alt={item.name}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="text-sm text-gray-600">Price: {formatPrice(item.price)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{formatPrice(item.subtotal)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No items in this order</p>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold">{formatPrice(order.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">{formatPrice(order.tax)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="text-orange-600" />
                                    Shipping Address
                                </h2>
                                <div className="text-gray-700">
                                    <p className="font-semibold">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.phone}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        {order.customer && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Customer</h2>
                                <div className="space-y-2 text-gray-700">
                                    <p className="font-semibold">{order.customer.name}</p>
                                    <p className="text-sm">{order.customer.email}</p>
                                    <p className="text-sm">{order.customer.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-semibold capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                {order.paymentReference && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reference</span>
                                        <span className="font-mono text-sm">{order.paymentReference}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Update Order Status */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Order Status
                                    </label>
                                    <select
                                        value={updateData.orderStatus}
                                        onChange={(e) => setUpdateData({ ...updateData, orderStatus: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tracking Number
                                    </label>
                                    <input
                                        type="text"
                                        value={updateData.trackingNumber}
                                        onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter tracking number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={updateData.notes}
                                        onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="Add notes..."
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateOrder}
                                    disabled={updating}
                                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {updating ? 'Updating...' : 'Update Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default OrderDetailPage;