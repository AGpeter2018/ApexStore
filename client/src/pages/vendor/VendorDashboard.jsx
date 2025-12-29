import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Truck, ArrowRight, LayoutGrid, CreditCard, Sparkles, AlertCircle, Zap, BarChart3 } from 'lucide-react';

const VendorDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [vendor, setVendor] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsRes, ordersRes, vendorRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/orders/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/orders?limit=5`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/vendors/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data);
            console.log(statsRes.data.data)
            console.log(ordersRes.data.data)
            const vendorData = vendorRes.data.data;
            console.log(vendorData)
            setVendor(vendorData);
            setLoading(false);

            // Fetch AI Insights once vendor ID is available
            if (vendorData?._id) {
                fetchAIInsights(vendorData._id, token);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const fetchAIInsights = async (vendorId, token) => {
        try {
            setInsightsLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ai/vendor-insights/${vendorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setAiInsights(data.data);
            }
        } catch (error) {
            console.error('Error fetching AI insights:', error);
        } finally {
            setInsightsLoading(false);
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
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Vendor Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Overview of your store's performance and recent activity.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Orders Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="bg-orange-100 p-3 rounded-xl rotate-3 group-hover:rotate-6 transition-transform">
                                <ShoppingCart size={24} className="text-orange-600" />
                            </div>
                            <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                                <TrendingUp size={16} className="mr-1" /> +12%
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalOrders || 0}</p>
                        </div>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="bg-green-100 p-3 rounded-xl rotate-3 group-hover:rotate-6 transition-transform">
                                <DollarSign size={24} className="text-green-600" />
                            </div>
                            <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
                                <TrendingUp size={16} className="mr-1" /> +24%
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatPrice(stats?.totalRevenue || 0)}</p>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-yellow-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="bg-yellow-100 p-3 rounded-xl rotate-3 group-hover:rotate-6 transition-transform">
                                <Clock size={24} className="text-yellow-600" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-medium">Pending Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.pendingOrders || 0}</p>
                        </div>
                    </div>

                    {/* Processing Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="bg-blue-100 p-3 rounded-xl rotate-3 group-hover:rotate-6 transition-transform">
                                <Package size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-medium">Processing</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.processingOrders || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Order Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending', count: stats?.pendingOrders || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600', shadow: 'shadow-yellow-200' },
                        { label: 'Shipped', count: stats?.shippedOrders || 0, icon: Truck, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-200' },
                        { label: 'Delivered', count: stats?.deliveredOrders || 0, icon: CheckCircle, color: 'from-green-500 to-green-600', shadow: 'shadow-green-200' },
                        { label: 'Cancelled', count: stats?.cancelledOrders || 0, icon: XCircle, color: 'from-red-500 to-red-600', shadow: 'shadow-red-200' },
                    ].map((item, index) => (
                        <div key={index} className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-white shadow-lg ${item.shadow} transform hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                <item.icon size={100} />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <item.icon size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium">{item.label}</p>
                                    <p className="text-2xl font-bold">{item.count}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area: Quick Actions & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <LayoutGrid size={20} className="text-gray-400" />
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <Link
                                    to="/vendor/orders"
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-700 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-gray-500 group-hover:text-orange-600 transition-colors">
                                            <ShoppingCart size={20} />
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-orange-700">Manage Orders</span>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                                </Link>

                                <Link
                                    to="/vendor/product/list"
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-gray-500 group-hover:text-blue-600 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-blue-700">My Products</span>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </Link>

                                <Link
                                    to="/vendor/payments"
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-green-50 hover:text-green-700 group transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-gray-500 group-hover:text-green-600 transition-colors">
                                            <CreditCard size={20} />
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-green-700">Payments</span>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                                </Link>
                            </div>
                        </div>


                        {/* AI Insights Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-500/20 p-2 rounded-lg backdrop-blur-sm">
                                        <Sparkles className="text-indigo-400" size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">AI Business Insights</h2>
                                </div>
                                {insightsLoading && <Zap size={18} className="text-indigo-400 animate-pulse" />}
                            </div>

                            <div className="p-6 space-y-4">
                                {insightsLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-5/6" />
                                            </div>
                                        </div>
                                    ))
                                ) : aiInsights.length > 0 ? (
                                    aiInsights.map((insight, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                            <div className={`p-2 rounded-lg h-fit ${insight.type === 'stock' ? 'bg-orange-100 text-orange-600' :
                                                    insight.type === 'marketing' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'
                                                }`}>
                                                {insight.type === 'stock' ? <BarChart3 size={20} /> :
                                                    insight.type === 'marketing' ? <TrendingUp size={20} /> :
                                                        <ArrowRight size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{insight.title}</h4>
                                                <p className="text-gray-600 text-xs mt-1 leading-relaxed">{insight.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-500 text-sm">No insights available yet.</p>
                                    </div>
                                )}

                                <button className="w-full mt-2 py-3 border border-indigo-100 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                    <Zap size={14} /> Refresh Insights
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                                <p className="text-gray-400 text-sm mb-4">Check our vendor documentation for guides and tips.</p>
                                <button className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                                    View Documentation
                                </button>
                            </div>
                            <div className="absolute -bottom-8 -right-8 opacity-10">
                                <LayoutGrid size={150} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Orders Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                                <Link to="/vendor/orders" className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    View All <ArrowRight size={16} />
                                </Link>
                            </div>

                            {recentOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-l-lg">Order ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-r-lg">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            to={`/vendor/orders/${order._id}`}
                                                            className="text-orange-600 font-semibold hover:underline"
                                                        >
                                                            #{order.orderNumber}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{order.customer?.name}</span>
                                                            <span className="text-xs text-gray-500">{order.customer?.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 font-bold text-gray-900">
                                                        {formatPrice(order.total)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-gray-500 text-sm">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                        <ShoppingCart size={32} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                                    <p className="text-gray-500 mt-1 max-w-xs mx-auto">When you receive new orders, they will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
