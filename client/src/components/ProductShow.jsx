import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Tag, Package, ShoppingCart } from 'lucide-react';

const ProductShow = () => {
    const { slug } = useParams();
    const [collectionData, setCollectionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCollection();
    }, [slug]);

    const fetchCollection = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/collections/${slug}`);
            setCollectionData(data.data);
            console.log('Fetched collection:', data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Collection not found');
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

    const getStockBadge = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-500' };
        if (stock <= 5) return { text: 'Low Stock', color: 'bg-yellow-500' };
        return { text: 'In Stock', color: 'bg-green-500' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    if (error || !collectionData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error || 'Collection not found'}</p>
                </div>
                <Link to="/collections" className="text-orange-600 hover:underline mt-4 inline-block">
                    ← Back to Collections
                </Link>
            </div>
        );
    }

    const { collection, products } = collectionData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link 
                        to="/collections" 
                        className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
                    >
                        <ChevronLeft size={20} />
                        Back to Collections
                    </Link>
                </div>
            </div>

            {/* Collection Header */}
            <div className="relative h-96 bg-gradient-to-r from-orange-600 to-red-600">
                <img
                    src={collection.collectionImage?.url}
                    alt={collection.collectionImage?.alt || collection.name}
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-6xl font-bold mb-4">{collection.name}</h1>
                        <p className="text-xl max-w-2xl mx-auto px-4">
                            {collection.description}
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
                                <Package className="inline mr-2" size={20} />
                                {products.length} {products.length === 1 ? 'Product' : 'Products'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Available Drums
                </h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => {
                            const stockBadge = getStockBadge(product.stock);
                            const discount = product.compareAtPrice && product.compareAtPrice > product.price
                                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                                : 0;

                            return (
                                <Link 
                                    key={product._id} 
                                    to={`/products/${product.slug}`}
                                    className="group"
                                >
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300">
                                        {/* Product Image */}
                                        <div className="relative h-64 overflow-hidden bg-gray-100">
                                            <img
                                                src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Drum'}
                                                alt={product.images?.[0]?.alt || product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            
                                            {/* Badges */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                {discount > 0 && (
                                                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                        -{discount}%
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">Out of Stock</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            {/* Drum Type Badge */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                                    {product.drumType}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${stockBadge.color}`}></div>
                                            </div>

                                            {/* Product Name */}
                                            <h3 className="font-bold text-lg mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>

                                            {/* Rating */}
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1 mb-3">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span 
                                                                key={i} 
                                                                className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        ({product.numReviews})
                                                    </span>
                                                </div>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-baseline gap-2 mb-3">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatPrice(product.compareAtPrice)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* View Button */}
                                            <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                                                <ShoppingCart size={18} />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-xl">No products in this collection yet.</p>
                        <p className="text-gray-400 mt-2">Check back soon for new arrivals!</p>
                    </div>
                )}
            </div>

            {/* Gallery Section (if available) */}
            {collection.galleryImages && collection.galleryImages.length > 0 && (
                <div className="bg-white py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Gallery</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {collection.galleryImages.map((image, index) => (
                                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                                    <img
                                        src={image.url}
                                        alt={image.alt || `Gallery ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductShow;