import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Layers, Plus, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
        const [products, setProducts] = useState([]);
        const [error, setError] = useState('');
        useEffect(() => {
            fetchProducts();
        }, []);
    
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
                setProducts(data.data);
                // setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products');
                // setLoading(false);
            }
        };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (stock <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your Yoruba drums store</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link
                        to="/admin/productList"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
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
                        to="/admin/collection/list"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <Layers size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Collections</h3>
                                <p className="text-gray-600 text-sm">Organize products</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/add-product"
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
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
                        to="/admin/analytics"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-4 rounded-lg">
                                <BarChart3 size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Analytics</h3>
                                <p className="text-gray-600 text-sm">View insights</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                    {
                        products.map((product, id) => {
                            const stockData = getStockStatus(product.stock)        
                   return <div key={id} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-orange-600">{product.stock}</p>
                            <p className="text-gray-600 mt-2">Total Products</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-blue-600">{product.name}</p>
                            <p className="text-gray-600 mt-2">Collections</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold te xt-green-600">{formatPrice(product.price)}</p>
                            <p className="text-gray-600 mt-2">Total Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-red-600">{product.stock}</p>
                            <p className="text-gray-600 mt-2">{stockData.text}</p>
                        </div>
                    </div>
                        })
                    }
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Create Collections</h3>
                                <p className="text-gray-600 text-sm">Organize your drums into collections like "Talking Drums", "Bata Drums", etc.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Set Up Cloudinary</h3>
                                <p className="text-gray-600 text-sm">Configure your Cloudinary credentials in the .env file for image uploads.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Add Products</h3>
                                <p className="text-gray-600 text-sm">Start adding your authentic Yoruba drums with detailed descriptions and images.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
