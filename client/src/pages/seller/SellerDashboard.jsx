import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const SellerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsRes, ordersRes, productsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/orders/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/orders?limit=5`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/products`)
            ]);

            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <ShoppingCart size={24} className="text-orange-600" />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <DollarSign size={24} className="text-green-600" />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Clock size={24} className="text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">Pending Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Package size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">Processing</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.processingOrders || 0}</p>
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock size={32} />
                            <div>
                                <p className="text-yellow-100 text-sm">Pending</p>
                                <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Truck size={32} />
                            <div>
                                <p className="text-purple-100 text-sm">Shipped</p>
                                <p className="text-3xl font-bold">{stats?.shippedOrders || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle size={32} />
                            <div>
                                <p className="text-green-100 text-sm">Delivered</p>
                                <p className="text-3xl font-bold">{stats?.deliveredOrders || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle size={32} />
                            <div>
                                <p className="text-red-100 text-sm">Cancelled</p>
                                <p className="text-3xl font-bold">{stats?.cancelledOrders || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/seller/orders"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-100 p-4 rounded-lg">
                                <ShoppingCart size={32} className="text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Manage Orders</h3>
                                <p className="text-gray-600 text-sm">View and process orders</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/seller/product/list"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <Package size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">My Products</h3>
                                <p className="text-gray-600 text-sm">Manage your inventory</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/seller/payments"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-4 rounded-lg">
                                <DollarSign size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Payments</h3>
                                <p className="text-gray-600 text-sm">Track your earnings</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                        <Link to="/seller/orders" className="text-orange-600 hover:text-orange-700 font-semibold">
                            View All →
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order #</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link 
                                                    to={`/seller/orders/${order._id}`}
                                                    className="text-orange-600 hover:text-orange-700 font-semibold"
                                                >
                                                    {order.orderNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{order.customer?.name}</p>
                                                    <p className="text-sm text-gray-500">{order.customer?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No orders yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
