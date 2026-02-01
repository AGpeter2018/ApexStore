import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Eye, Filter, Download, Search, AlertCircle } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        search: ''
    });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchOrders();
    }, [filters.status, filters.paymentStatus]); // Only refetch when filters change

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;

            const { data } = await orderAPI.getOrders(params);

            setOrders(data.data || []);
            console.log(data.data)
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch orders');
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredOrders = orders.filter(order => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                order.orderNumber?.toLowerCase().includes(searchLower) ||
                order.customer?.name?.toLowerCase().includes(searchLower) ||
                order.customer?.email?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-bold">Error Loading Orders</p>
                            <p>{error}</p>
                            <button
                                onClick={fetchOrders}
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-600 mt-2">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Order #, customer..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Order Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={filters.paymentStatus}
                                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Payments</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={fetchOrders}
                                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Refresh
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <Download size={20} />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                {filteredOrders.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{order.customer?.name || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">{order.customer?.email || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">{order.customer?.phone || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900">{order.items?.length || 0} item(s)</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900 border-b border-dashed border-gray-100 pb-1 mb-1">
                                                    {formatPrice(
                                                        order.items.reduce((sum, item) => {
                                                            const itemAmount = item.subtotal || (item.price * item.quantity);
                                                            if (user.role === 'admin') {
                                                                // Admin gets 10% commission of all items
                                                                return sum + (itemAmount * 0.10);
                                                            } else {
                                                                // Vendor gets 90% share of their items
                                                                if (item.vendor?.toString() === user._id) {
                                                                    return sum + (itemAmount * 0.90);
                                                                }
                                                            }
                                                            return sum;
                                                        }, 0)
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Share</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/orders/${order._id}`}
                                                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                                                >
                                                    <Eye size={18} />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-gray-300 mb-4">
                            <Filter size={64} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status || filters.paymentStatus
                                ? 'Try adjusting your filters'
                                : 'No orders have been placed yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;