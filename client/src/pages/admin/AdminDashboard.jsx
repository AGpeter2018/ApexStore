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
    ShoppingBag
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch statistics
            const statsResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/products/stats`
            );
            setStats(statsResponse.data.data);

            // Fetch recent products (top 5)
            const productsResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/products?limit=5&sort=-createdAt`
            );
            setProducts(productsResponse.data.data);

            setLoading(false);
        } catch (err) {
            console.error('Dashboard error:', err);
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
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

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Products */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats?.overview?.total || 0}
                                </p>
                                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                    <TrendingUp size={16} />
                                    {stats?.overview?.active || 0} active
                                </p>
                            </div>
                            <div className="bg-orange-100 p-4 rounded-lg">
                                <Package className="text-orange-600" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Total Inventory Value */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    ₦{formatNumber(stats?.pricing?.totalInventoryValue || 0)}
                                </p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Avg: {formatPrice(stats?.pricing?.avgPrice || 0)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <DollarSign className="text-green-600" size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Featured Products */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Featured</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats?.overview?.featured || 0}
                                </p>
                                <p className="text-blue-600 text-sm mt-2">
                                    Active promotions
                                </p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <ShoppingBag className="text-blue-600" size={32} />
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

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                {/* Top Vendors */}
                {stats?.byVendor && stats.byVendor.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Top Vendors</h2>
                            <Link 
                                to="/admin/vendors" 
                                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Vendor</th>
                                        <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">Products</th>
                                        <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">Inventory Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.byVendor.slice(0, 5).map((vendor) => (
                                        <tr key={vendor.vendorId} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-900">
                                                    {vendor.vendorName || 'Unknown Vendor'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                                {vendor.count}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-gray-900">
                                                {formatPrice(vendor.totalValue || 0)}
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
                                        <p className={`text-sm mt-1 ${
                                            product.stockQuantity === 0 
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