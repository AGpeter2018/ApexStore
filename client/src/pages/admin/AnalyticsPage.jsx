import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Package, Layers, AlertTriangle, DollarSign, Eye, Star, ShoppingCart } from 'lucide-react';

const AnalyticsPage = () => {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCollections: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        featuredProducts: 0,
        averagePrice: 0,
        totalStock: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, collectionsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/products`),
                axios.get(`${import.meta.env.VITE_API_URL}/collections`)
            ]);

            const productsData = productsRes.data.data;
            const collectionsData = collectionsRes.data.data;

            setProducts(productsData);
            setCollections(collectionsData);

            // Calculate statistics
            const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock), 0);
            const lowStockCount = productsData.filter(p => p.stock > 0 && p.stock <= 5).length;
            const outOfStockCount = productsData.filter(p => p.stock === 0).length;
            const featuredProducts = productsData.filter(p => p.featured).length;
            const averagePrice = productsData.length > 0 
                ? productsData.reduce((sum, p) => sum + p.price, 0) / productsData.length 
                : 0;
            const totalStock = productsData.reduce((sum, p) => sum + p.stock, 0);

            setStats({
                totalProducts: productsData.length,
                totalCollections: collectionsData.length,
                totalValue,
                lowStockCount,
                outOfStockCount,
                featuredProducts,
                averagePrice,
                totalStock
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const getDrumTypeDistribution = () => {
        const distribution = {};
        products.forEach(p => {
            distribution[p.drumType] = (distribution[p.drumType] || 0) + 1;
        });
        return Object.entries(distribution).sort((a, b) => b[1] - a[1]);
    };

    const getTopProducts = () => {
        return [...products]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
    };

    const getLowStockProducts = () => {
        return products.filter(p => p.stock > 0 && p.stock <= 5);
    };

    const getOutOfStockProducts = () => {
        return products.filter(p => p.stock === 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    const drumTypeDistribution = getDrumTypeDistribution();
    const topProducts = getTopProducts();
    const lowStockProducts = getLowStockProducts();
    const outOfStockProducts = getOutOfStockProducts();

    return (
        <div className="min-h-screen bg-gray-50 py-25">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Analytics & Reports</h1>
                    <p className="text-gray-600 mt-2">Overview of your store performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <Package size={24} className="text-orange-600" />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">Total Products</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Layers size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">Collections</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalCollections}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <DollarSign size={24} className="text-green-600" />
                            </div>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <p className="text-gray-600 text-sm">Total Inventory Value</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-red-100 p-3 rounded-lg">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">Low/Out of Stock</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats.lowStockCount + stats.outOfStockCount}
                        </p>
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                        <p className="text-purple-100 text-sm mb-2">Featured Products</p>
                        <p className="text-4xl font-bold">{stats.featuredProducts}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
                        <p className="text-indigo-100 text-sm mb-2">Average Price</p>
                        <p className="text-2xl font-bold">{formatPrice(stats.averagePrice)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
                        <p className="text-teal-100 text-sm mb-2">Total Stock</p>
                        <p className="text-4xl font-bold">{stats.totalStock}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
                        <p className="text-orange-100 text-sm mb-2">Out of Stock</p>
                        <p className="text-4xl font-bold">{stats.outOfStockCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Drum Type Distribution */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Drum Type Distribution</h2>
                        
                        {drumTypeDistribution.length > 0 ? (
                            <div className="space-y-4">
                                {drumTypeDistribution.map(([type, count]) => {
                                    const percentage = (count / stats.totalProducts) * 100;
                                    return (
                                        <div key={type}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-700">{type}</span>
                                                <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No products yet</p>
                        )}
                    </div>

                    {/* Top Rated Products */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="text-yellow-500" fill="currentColor" />
                            Top Rated Products
                        </h2>
                        
                        {topProducts.length > 0 ? (
                            <div className="space-y-4">
                                {topProducts.map((product, index) => (
                                    <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-400">
                                            #{index + 1}
                                        </div>
                                        <img
                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                            alt={product.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-yellow-500 flex items-center">
                                                    ★ {product.rating.toFixed(1)}
                                                </span>
                                                <span className="text-gray-500">
                                                    ({product.numReviews} reviews)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                                            <p className="text-sm text-gray-500">{product.stock} in stock</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No products yet</p>
                        )}
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" />
                            Low Stock Alert ({lowStockProducts.length})
                        </h2>
                        
                        {lowStockProducts.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {lowStockProducts.map((product) => (
                                    <div key={product._id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <img
                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                            alt={product.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-600">{product.drumType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-yellow-600">{product.stock}</p>
                                            <p className="text-xs text-gray-500">remaining</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-green-600 font-semibold">✓ All products well stocked</p>
                            </div>
                        )}
                    </div>

                    {/* Out of Stock */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" />
                            Out of Stock ({outOfStockProducts.length})
                        </h2>
                        
                        {outOfStockProducts.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {outOfStockProducts.map((product) => (
                                    <div key={product._id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <img
                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                            alt={product.name}
                                            className="w-12 h-12 rounded-lg object-cover opacity-50"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-600">{product.drumType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">0</p>
                                            <p className="text-xs text-gray-500">in stock</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-green-600 font-semibold">✓ No out of stock items</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collection Performance */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Collection Overview</h2>
                    
                    {collections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {collections.map((collection) => {
                                const collectionProducts = products.filter(
                                    p => p.collection?._id === collection._id
                                );
                                const collectionValue = collectionProducts.reduce(
                                    (sum, p) => sum + (p.price * p.stock), 0
                                );

                                return (
                                    <div key={collection._id} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img
                                                src={collection.collectionImage?.url || 'https://via.placeholder.com/60'}
                                                alt={collection.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <h3 className="font-bold text-gray-900">{collection.name}</h3>
                                                {collection.featured && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Products</p>
                                                <p className="font-bold text-gray-900">{collectionProducts.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Value</p>
                                                <p className="font-bold text-gray-900">{formatPrice(collectionValue)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No collections yet</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-md p-8 mt-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to grow your inventory?</h2>
                    <p className="text-lg mb-6 opacity-90">
                        Keep your store fresh with new products and collections
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="/admin/add-product"
                            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                        >
                            Add Product
                        </a>
                        <a
                            href="/admin/add-collection"
                            className="bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors"
                        >
                            Add Collection
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
