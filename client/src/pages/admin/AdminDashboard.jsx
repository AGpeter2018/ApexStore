import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package,
    Layers,
    Plus,
    Users,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    ShoppingCart,
    Store,
    ArrowRight,
    Brain,
    Sparkles,
    Zap
} from 'lucide-react';

const AdminDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const [stats, setStats] = useState(null);
    const [orderStats, setOrderStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token')

            // Fetch statistics
            const [statsResponse, orderStatsResponse, productsResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/admin/products/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/orders/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/products?limit=5&sort=-createdAt`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats(statsResponse.data.data);
            setOrderStats(orderStatsResponse.data.data);
            setProducts(productsResponse.data.data);
            setRecentOrders(orderStatsResponse.data.data.recentOrders || []);
            console.log(orderStatsResponse.data.data)


            // Fetch AI Insights
            fetchAIInsights(token);

            setLoading(false);
        } catch (err) {
            console.error('Dashboard error:', err);
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    const fetchAIInsights = async (token) => {
        try {
            setLoadingAI(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/ai/admin-insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAiInsights(response.data.data);
            setLoadingAI(false);
        } catch (err) {
            console.error('AI Insights error:', err);
            setLoadingAI(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
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
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-red-800 mb-2">Error Loading Dashboard</h3>
                                <p className="text-red-700">{error}</p>
                                <button
                                    onClick={fetchDashboardData}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
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
                    <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your multi-category marketplace</p>
                </div>

                {/* Quick Stats Cards */}
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {formatPrice(orderStats?.totalRevenue || 0)}
                                </p>
                                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                    <TrendingUp size={16} />
                                    Processed Sales
                                </p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <DollarSign className="text-green-600" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {orderStats?.totalOrders || 0}
                                </p>
                                <p className="text-blue-600 text-sm mt-2 flex items-center gap-1">
                                    <ShoppingCart size={16} />
                                    {orderStats?.pendingOrders || 0} pending
                                </p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <ShoppingCart className="text-blue-600" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Total Products */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats?.overview?.total || 0}
                                </p>
                                <p className="text-orange-600 text-sm mt-2 flex items-center gap-1">
                                    <Package size={16} />
                                    {stats?.overview?.active || 0} active
                                </p>
                            </div>
                            <div className="bg-orange-100 p-4 rounded-lg">
                                <Package className="text-orange-600" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Stock Alerts</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {(stats?.overview?.lowStock || 0) + (stats?.overview?.outOfStock || 0)}
                                </p>
                                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                    <AlertTriangle size={16} />
                                    {stats?.overview?.outOfStock || 0} out of stock
                                </p>
                            </div>
                            <div className="bg-red-100 p-4 rounded-lg">
                                <AlertTriangle className="text-red-600" size={32} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <Link
                        to="/admin/product/add"
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-lg">
                                <Plus size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Add Product</h3>
                                <p className="text-white/80 text-sm">Create new listing</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/product/list"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-100 p-4 rounded-lg">
                                <Package size={32} className="text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Products</h3>
                                <p className="text-gray-600 text-sm">Manage inventory</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/categories"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <Layers size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Categories</h3>
                                <p className="text-gray-600 text-sm">Organize catalog</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/users"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-4 rounded-lg">
                                <Users size={32} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Users</h3>
                                <p className="text-gray-600 text-sm">Manage accounts</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/vendor/orders"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-100 p-4 rounded-lg">
                                <ShoppingCart size={32} className="text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Orders</h3>
                                <p className="text-gray-600 text-sm">Manage sales</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/vendors"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-4 rounded-lg">
                                <Store size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Vendors</h3>
                                <p className="text-gray-600 text-sm">Manage sellers</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* AI Market Intel Panel */}
                <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 mb-8 border border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain size={120} className="text-orange-500" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-orange-500/20 p-2 rounded-lg">
                                <Sparkles className="text-orange-500" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Market Intel</h2>
                                <p className="text-slate-400 text-sm">AI-Powered Strategic Analytics</p>
                            </div>
                            <span className="ml-auto bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-orange-500/20">
                                LIVE INTEL
                            </span>
                        </div>

                        {loadingAI ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl p-6 h-32"></div>
                                ))}
                            </div>
                        ) : aiInsights.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {aiInsights.map((insight, idx) => (
                                    <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all hover:translate-y-[-4px]">
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="mt-1">
                                                <Zap className={`${insight.type === 'marketing' ? 'text-blue-400' : insight.type === 'inventory' ? 'text-orange-400' : 'text-purple-400'}`} size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-slate-200 font-bold mb-1">{insight.title}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    {insight.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 italic">No strategic data available at this time.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products by Category */}
                {stats?.byCategory && stats.byCategory.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Products by Category</h2>
                            <Link
                                to="/admin/categories"
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.byCategory.slice(0, 6).map((cat) => (
                                <div
                                    key={cat.categoryId}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {cat.categoryName || 'Uncategorized'}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {cat.count} products
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatPrice(cat.totalValue || 0)}
                                            </p>
                                            <p className="text-xs text-gray-500">Total value</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            <Link to="/vendor/orders" className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-l-lg">Order #</th>
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
                    </div>
                )}

                {/* Recent Products */}
                {products.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Products</h2>
                            <Link
                                to="/admin/product/list"
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {products.map((product) => (
                                <Link
                                    key={product._id}
                                    to={`/admin/product/edit/${product._id}`}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 transition-colors"
                                >
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.images?.[0]?.url ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="text-gray-400" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {product.categoryId?.name || 'Uncategorized'}
                                            {product.subcategoryId && ` > ${product.subcategoryId.name}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                                        <p className={`text-sm mt-1 ${product.stockQuantity === 0
                                            ? 'text-red-600'
                                            : product.stockQuantity <= 5
                                                ? 'text-yellow-600'
                                                : 'text-green-600'
                                            }`}>
                                            {product.stockQuantity === 0
                                                ? 'Out of Stock'
                                                : `${product.stockQuantity} in stock`
                                            }
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Start Guide */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Create Categories</h3>
                                <p className="text-gray-600 text-sm">Set up your product categories like Fashion, Musical Instruments, Electronics, etc.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Configure Image Storage</h3>
                                <p className="text-gray-600 text-sm">Set up Cloudinary credentials in your .env file for product image uploads.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Add Products</h3>
                                <p className="text-gray-600 text-sm">Start adding products with detailed descriptions, specifications, and high-quality images.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                4
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Manage Inventory</h3>
                                <p className="text-gray-600 text-sm">Monitor stock levels, update prices, and feature products to drive sales.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;