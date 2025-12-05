import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Star, MapPin, User } from 'lucide-react';

const ProductItem = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products/${slug}`);
            setProduct(data.data);
            console.log('Fetched product:', data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Product not found');
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

    const calculateDiscount = () => {
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
            return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
        }
        return 0;
    };

       if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error || 'Product not found'}</p>
                </div>
                <Link to="/collections" className="text-orange-600 hover:underline mt-4 inline-block">
                    ← Back to Collections
                </Link>
            </div>
        );
    }

    const discount = calculateDiscount();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link to="/collections" className="hover:text-orange-600">Collections</Link>
                        <span>/</span>
                        <Link to={`/collections/${product.collection?.slug}`} className="hover:text-orange-600">
                            {product.collection?.name}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </div>
                </div>
            </div>


            {/* Product Details */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Images Section */}
                    <div>
                        {/* Main Image */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
                            <div className="aspect-square">
                                <img
                                    src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600x600?text=Drum'}
                                    alt={product.images?.[selectedImage]?.alt || product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage === index 
                                                ? 'border-orange-600 shadow-lg' 
                                                : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.alt || `View ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div>
                        {/* Drum Type Badge */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                                {product.drumType}
                            </span>
                            {product.featured && (
                                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <Star size={14} fill="currentColor" />
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                        {/* Rating */}
                        {product.rating > 0 && (
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    {product.rating.toFixed(1)} ({product.numReviews} reviews)
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                </span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            {formatPrice(product.compareAtPrice)}
                                        </span>
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            Save {discount}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <p className="text-gray-700 text-lg mb-6">
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.stock > 0 ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-semibold">
                                        {product.stock <= 5 ? `Only ${product.stock} left in stock!` : 'In Stock'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="font-semibold">Out of Stock</span>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-6 py-2 border-x border-gray-300">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="px-4 py-2 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-8">
                            <button 
                                disabled={product.stock === 0}
                                className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={24} />
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button className="border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                <Heart size={24} />
                            </button>
                            <button className="border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                <Share2 size={24} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-100 rounded-lg">
                            <div className="text-center">
                                <Truck className="mx-auto mb-2 text-orange-600" size={32} />
                                <p className="text-sm font-semibold">Free Shipping</p>
                            </div>
                            <div className="text-center">
                                <Shield className="mx-auto mb-2 text-orange-600" size={32} />
                                <p className="text-sm font-semibold">Authentic</p>
                            </div>
                            <div className="text-center">
                                <RotateCcw className="mx-auto mb-2 text-orange-600" size={32} />
                                <p className="text-sm font-semibold">7-Day Return</p>
                            </div>
                        </div>

                        {/* Origin Info */}
                        {product.origin && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <MapPin size={20} className="text-orange-600" />
                                    Crafted in Nigeria
                                </h3>
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p>📍 {product.origin.city}, {product.origin.state} State</p>
                                    {product.origin.artisan && (
                                        <p className="flex items-center gap-1">
                                            <User size={16} />
                                            Artisan: {product.origin.artisan}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Information Tabs */}
                <div className="mt-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.dimensions?.height && (
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="font-semibold">Height</span>
                                        <span>{product.dimensions.height} cm</span>
                                    </div>
                                )}
                                {product.dimensions?.diameter && (
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="font-semibold">Diameter</span>
                                        <span>{product.dimensions.diameter} cm</span>
                                    </div>
                                )}
                                {product.dimensions?.weight && (
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="font-semibold">Weight</span>
                                        <span>{product.dimensions.weight} kg</span>
                                    </div>
                                )}
                                {product.woodType && (
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="font-semibold">Wood Type</span>
                                        <span>{product.woodType}</span>
                                    </div>
                                )}
                                {product.skinType && (
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="font-semibold">Skin Type</span>
                                        <span>{product.skinType}</span>
                                    </div>
                                )}
                                {product.tuning && (
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="font-semibold">Tuning</span>
                                        <span>{product.tuning}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Materials */}
                        {product.materials && product.materials.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Materials Used</h2>
                                <div className="flex flex-wrap gap-2">
                                    {product.materials.map((material, index) => (
                                        <span 
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
                                        >
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Features</h2>
                                <ul className="space-y-2">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-orange-600 mt-1">✓</span>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Care Instructions */}
                        {product.careInstructions && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Care Instructions</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {product.careInstructions}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductItem;