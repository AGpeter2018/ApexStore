import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vendorAPI } from '../../utils/api';
import {
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    TrendingUp,
    ShoppingBag,
    Package,
    Star,
    ChevronRight,
    Search,
    Filter,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertCircle,
    ExternalLink,
    RefreshCw,
    Facebook,
    Instagram,
    Linkedin,
    Twitter
} from 'lucide-react';


const VendorAccountDetailPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [vendorData, setVendorData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVendorDetail();
    }, [id]);

    const fetchVendorDetail = async () => {
        try {
            setLoading(true);
            const response = await vendorAPI.getVendorDetail(id);

            if (response.data.success) {
                setVendorData(response.data.data);
                // Pre-populate products and orders from the detail response for the overview
                setProducts(response.data.data.latestProducts || []);
                setOrders(response.data.data.latestOrders || []);
                console.log(response.data.data)
            }
        } catch (err) {
            console.error('Error fetching vendor detail:', err);
            setError('Failed to load vendor details.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (update) => {
        try {
            const response = await vendorAPI.updateVendorStatus(id, update);

            if (response.data.success) {
                // Update local state
                setVendorData(prev => ({
                    ...prev,
                    vendor: {
                        ...prev.vendor,
                        ...update
                    }
                }));
                alert('Status updated successfully');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (error || !vendorData) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{error || 'Vendor not found'}</p>
                <Link to="/admin/vendors" className="text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2">
                    <ArrowLeft size={20} /> Back to Vendors
                </Link>
            </div>
        );
    }

    const { vendor, stats, latestProducts, latestOrders } = vendorData;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Navbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/vendors" className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{vendor.storeName}</h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <User size={16} /> {vendor.owner?.name} • Member since {new Date(vendor.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleStatusUpdate({ isApproved: !vendor.isApproved })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${vendor.isApproved
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                }`}
                        >
                            {vendor.isApproved ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {vendor.isApproved ? 'Approved' : 'Pending Approval'}
                        </button>
                        <button
                            onClick={() => handleStatusUpdate({ isActive: !vendor.isActive })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${vendor.isActive
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                        >
                            {vendor.isActive ? <RefreshCw size={18} /> : <XCircle size={18} />}
                            {vendor.isActive ? 'Active' : 'Suspended'}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-orange-100 p-4 rounded-lg">
                            <TrendingUp className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₦{(stats.totalSales || 0).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <ShoppingBag className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-purple-100 p-4 rounded-lg">
                            <Package className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Active Products</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.productCount || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-yellow-100 p-4 rounded-lg">
                            <Star className="text-yellow-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Store Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.rating || '0.0'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Vendor Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Store Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Store className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Store Name</p>
                                        <p className="font-medium">{vendor.storeName}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{vendor.location || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Description</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {vendor.storeDescription || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Contact Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="font-medium">{vendor.owner?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-medium">{vendor.phone || vendor.owner?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Store Address</p>
                                        <p className="font-medium">{vendor.businessAddress || 'Not provided'}</p>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        {/* Social */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Social Handles</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Facebook className="text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Facebook</p>
                                        <p className="font-medium">{vendor.socials?.facebook}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Instagram className="text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Instagram</p>
                                        <p className="font-medium">{vendor.socials?.instagram || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Linkedin className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Linkedin</p>
                                        <p className="font-medium">{vendor.socials?.linkedin || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Twitter className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Twitter</p>
                                        <p className="font-medium">{vendor.socials?.twitter || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Content Tabs */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-1 py-4 px-6 text-sm font-bold transition-all ${activeTab === 'overview'
                                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Activity Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`flex-1 py-4 px-6 text-sm font-bold transition-all ${activeTab === 'products'
                                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Products ({stats.productCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex-1 py-4 px-6 text-sm font-bold transition-all ${activeTab === 'orders'
                                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Recent Orders
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-gray-900">Latest Products</h4>
                                                <button onClick={() => setActiveTab('products')} className="text-orange-600 text-sm font-medium hover:underline">View All</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {latestProducts.length > 0 ? latestProducts.map(product => (
                                                    <div key={product._id} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                                                        <img
                                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                                                            alt={product.name}
                                                            className="w-16 h-16 object-cover rounded-md"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-sm text-gray-500">{product.categoryId?.name}</p>
                                                            <p className="text-orange-600 font-bold">₦{product.price.toLocaleString()}</p>
                                                        </div>
                                                        <Link to={`/admin/product/edit/${product._id}`} className="text-gray-400 hover:text-orange-600 mt-1">
                                                            <ExternalLink size={18} />
                                                        </Link>
                                                    </div>
                                                )) : <p className="text-gray-500 text-center py-4">No products found.</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-gray-900">Recent Orders</h4>
                                                <button onClick={() => setActiveTab('orders')} className="text-orange-600 text-sm font-medium hover:underline">View All</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            <th className="pb-3 pr-4">Order ID</th>
                                                            <th className="pb-3 pr-4">Customer</th>
                                                            <th className="pb-3 pr-4">Amount</th>
                                                            <th className="pb-3 pr-4">Status</th>
                                                            <th className="pb-3">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {latestOrders.length > 0 ? latestOrders.map(order => (
                                                            <tr key={order._id} className="text-sm">
                                                                <td className="py-3 pr-4 font-medium text-gray-900">#{order.orderNumber}</td>
                                                                <td className="py-3 pr-4 text-gray-600">{order.customer?.name}</td>
                                                                <td className="py-3 pr-4 font-bold text-gray-900">₦{order.total.toLocaleString()}</td>
                                                                <td className="py-3 pr-4">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                            'bg-orange-100 text-orange-700'
                                                                        }`}>
                                                                        {order.orderStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3">
                                                                    <Link to={`/order-details/${order._id}`} className="text-orange-600 hover:text-orange-700">
                                                                        <ExternalLink size={16} />
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center py-4 text-gray-500">No orders found.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'products' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-900">All Vendor Products</h4>
                                            <Link to="/admin/product/add" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700">
                                                Add Product
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {products.length > 0 ? products.map(product => (
                                                <div key={product._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50">
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                                                        alt={product.name}
                                                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{product.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">
                                                                {product.categoryId?.name}
                                                            </span>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${product.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                                                }`}>
                                                                {product.isActive ? 'Active' : 'Hidden'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-end mt-2">
                                                            <p className="text-orange-600 font-bold">₦{product.price.toLocaleString()}</p>
                                                            <p className="text-xs text-gray-500">Stock: <span className={product.stockQuantity < 10 ? 'text-red-500 font-bold' : ''}>{product.stockQuantity}</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg">This vendor hasn't listed any products yet.</p>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 mb-4">Full Order History</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-lg">
                                                        <th className="p-4 rounded-l-lg text-left">Order Detail</th>
                                                        <th className="p-4 text-left">Customer</th>
                                                        <th className="p-4 text-left">Status</th>
                                                        <th className="p-4 text-right rounded-r-lg">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {orders.length > 0 ? orders.map(order => (
                                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-4">
                                                                <Link to={`/orders/${order._id}`} className="font-bold text-gray-900 hover:text-orange-600">
                                                                    #{order.orderNumber}
                                                                </Link>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-sm font-medium text-gray-900">{order.customer?.name}</p>
                                                                <p className="text-xs text-gray-500">{order.customer?.email}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                            'bg-orange-100 text-orange-700'
                                                                    }`}>
                                                                    {order.orderStatus.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <p className="font-bold text-gray-900 truncate">₦{order.total.toLocaleString()}</p>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">No orders found for this vendor.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAccountDetailPage;
