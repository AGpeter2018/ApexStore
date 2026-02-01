import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import axios from 'axios';
import {
    RotateCcw, Star, MapPin, User, Package, TrendingUp, Sparkles, Wand2, ShoppingCart, Heart, Share2, Truck, Shield
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';


const ProductItem = () => {
    const { slug } = useParams();
    const { productId } = useParams();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const isInWishlist = wishlistItems.some(item => item._id === product?._id || item === product?._id);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);


    useEffect(() => {
        fetchProduct();
    }, [slug]);


    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(false);

    useEffect(() => {
        if (product?._id) {
            fetchAIRecommendations();
        }
    }, [product?._id]);

    const fetchAIRecommendations = async () => {
        try {
            setRecLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ai/recommendations/${product._id}`);
            if (data.success) {
                setRecommendations(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch AI recommendations:", err);
            if (err.response?.status === 429) {
                console.log("AI Recommendations: Rate limited. Showing regular products.");
            }
        } finally {
            setRecLoading(false);
        }
    };

    const fetchProduct = async () => {
        try {
            // UPDATED: Changed endpoint to use /slug/ prefix
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/products/slug/${slug}`
            );
            setProduct(data.data);
            console.log('Fetched product:', data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Product not found');
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (productId, review) => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/products/${productId}/reviews`,
                review
            );

            // server returns updated reviews and stats in data.data
            setProduct((prev) => (prev ? { ...prev, ...data.data } : data.data));
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleWishlist = () => {
        if (!product?._id) return;
        dispatch(toggleWishlist(product._id));
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

    const handleAddToCart = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isLoggedIn = !!user.token;

        setAdding(true);
        try {
            if (isLoggedIn) {
                // For logged in users, save to server
                await dispatch(addToCart({
                    productId: product._id,
                    quantity
                })).unwrap();
            } else {
                // For guest users, save locally in Redux
                const { addItemLocally } = await import('../redux/slices/cartSlice');
                dispatch(addItemLocally({
                    product,
                    quantity
                }));
            }

            // Show success message
            alert('✅ Added to cart successfully!');
            // Reset quantity
            setQuantity(1);
        } catch (error) {
            alert('❌ ' + (error || 'Failed to add to cart'));
        } finally {
            setAdding(false);
        }
    };


    // NEW: Get stock quantity (supports both old and new field names)
    const getStockQuantity = () => {
        return product.stockQuantity ?? product.stock ?? 0;
    };

    // NEW: Render specifications dynamically based on category
    const renderSpecifications = () => {
        const specs = product.specifications || {};
        const hasLegacySpecs = product.drumType || product.woodType || product.skinType;

        // If no specifications, show legacy drum fields
        if (Object.keys(specs).length === 0 && !hasLegacySpecs) {
            return null;
        }

        return (
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dynamic specifications from specifications object */}
                    {Object.entries(specs).map(([key, value]) => {
                        // Skip nested objects (like dimensions)
                        if (typeof value === 'object' && !Array.isArray(value)) return null;

                        // Format the key (camelCase to Title Case)
                        const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase());

                        // Format the value
                        let displayValue = value;
                        if (Array.isArray(value)) {
                            displayValue = value.join(', ');
                        }

                        return (
                            <div key={key} className="flex justify-between py-3 border-b">
                                <span className="font-semibold">{formattedKey}</span>
                                <span className="text-gray-700">{displayValue}</span>
                            </div>
                        );
                    })}

                    {/* Dimensions (from specifications or legacy) */}
                    {(specs.dimensions || product.dimensions) && (
                        <>
                            {(specs.dimensions?.height || product.dimensions?.height) && (
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Height</span>
                                    <span>{specs.dimensions?.height || product.dimensions.height} cm</span>
                                </div>
                            )}
                            {(specs.dimensions?.diameter || product.dimensions?.diameter) && (
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Diameter</span>
                                    <span>{specs.dimensions?.diameter || product.dimensions.diameter} cm</span>
                                </div>
                            )}
                            {(specs.dimensions?.weight || product.dimensions?.weight) && (
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Weight</span>
                                    <span>{specs.dimensions?.weight || product.dimensions.weight} kg</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Legacy drum-specific fields (backward compatibility) */}
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
        );
    };

    // NEW: Handle description rendering (String vs Array of Objects)
    const renderDescription = () => {
        if (!product.description) return null;

        // Simple string description (legacy)
        if (typeof product.description === 'string') {
            return (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                </p>
            );
        }

        // Structured description (Array of objects)
        if (Array.isArray(product.description)) {
            return (
                <div className="space-y-6">
                    {product.description.map((block, index) => {
                        // Sort by order if available
                        // .sort((a, b) => (a.order || 0) - (b.order || 0))

                        switch (block.type) {
                            case 'text':
                                return (
                                    <div key={block._id || index}>
                                        {block.title && <h3 className="text-xl font-bold mb-2">{block.title}</h3>}
                                        <div
                                            className="text-gray-700 leading-relaxed whitespace-pre-line"
                                            dangerouslySetInnerHTML={{ __html: block.content }} // If rich text html
                                        />
                                    </div>
                                );
                            case 'list':
                                return (
                                    <div key={block._id || index}>
                                        {block.title && <h3 className="text-xl font-bold mb-2">{block.title}</h3>}
                                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                            {Array.isArray(block.content)
                                                ? block.content.map((item, i) => <li key={i}>{item}</li>)
                                                : <li>{String(block.content)}</li>
                                            }
                                        </ul>
                                    </div>
                                );
                            case 'image':
                                return (
                                    <div key={block._id || index} className="my-4">
                                        <img
                                            src={block.content}
                                            alt={block.title || 'Product detail'}
                                            className="w-full rounded-lg shadow-md"
                                        />
                                        {block.title && <p className="text-sm text-gray-500 mt-2 text-center">{block.title}</p>}
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error || 'Product not found'}</p>
                </div>
                <Link to="/categories" className="text-amber-600 hover:underline mt-4 inline-block">
                    ← Back to Categories
                </Link>
            </div>
        );
    }

    const discount = calculateDiscount();
    const stockQuantity = getStockQuantity();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb - UPDATED for new category system */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link to="/categories" className="hover:text-amber-600">Categories</Link>
                        <span>/</span>

                        {/* Main Category */}
                        {product.categoryId && (
                            <>
                                <Link
                                    to={`/categories/${product.categoryId.slug}`}
                                    className="hover:text-amber-600"
                                >
                                    {product.categoryId.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}

                        {/* Subcategory (if exists) */}
                        {product.subcategoryId && (
                            <>
                                <Link
                                    to={`/categories/${product.subcategoryId.slug}`}
                                    className="hover:text-amber-600"
                                >
                                    {product.subcategoryId.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}

                        {/* Legacy collection support */}
                        {!product.categoryId && product.collection && (
                            <>
                                <Link
                                    to={`/collections/${product.collection.slug}`}
                                    className="hover:text-amber-600"
                                >
                                    {product.collection.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}

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
                                    src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600x600?text=Product'}
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
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-amber-600 shadow-lg'
                                            : 'border-gray-200 hover:border-amber-300'
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
                        {/* Category/Type Badge - UPDATED to be flexible */}
                        <div className="flex items-center gap-2 mb-4">
                            {/* Show category or drumType */}
                            <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
                                {product.subcategoryId?.name ||
                                    product.categoryId?.name ||
                                    product.drumType ||
                                    'Product'}
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
                        {(product.rating > 0 || product.avgRating > 0) && (
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i < Math.floor(product.rating || product.avgRating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600">
                                    {(product.rating || product.avgRating).toFixed(1)}
                                    ({product.numReviews || product.reviewCount || 0} reviews)
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

                        {/* Stock Status - UPDATED with real-time indicator */}
                        <div className="mb-6">
                            {stockQuantity > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${stockQuantity <= (product.lowStockThreshold || 5) ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                                        }`}></div>
                                    <span className={`font-semibold ${stockQuantity <= (product.lowStockThreshold || 5) ? 'text-orange-600' : 'text-green-600'
                                        }`}>
                                        {stockQuantity <= (product.lowStockThreshold || 5)
                                            ? `Only ${stockQuantity} left in stock!`
                                            : `${stockQuantity} in stock`}
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
                        {stockQuantity > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 hover:bg-gray-100 transition"
                                        >
                                            -
                                        </button>
                                        <span className="px-6 py-2 border-x border-gray-300 font-semibold">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                            className="px-4 py-2 hover:bg-gray-100 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Max: {stockQuantity}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={stockQuantity === 0 || adding}
                                className="flex-1 bg-amber-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={24} />
                                {adding ? 'Adding...' : stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={handleToggleWishlist}
                                className={`border p-4 rounded-lg transition-colors flex items-center justify-center ${isInWishlist
                                    ? 'border-red-200 bg-red-50 text-red-500 shadow-inner'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-400'
                                    }`}
                                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart size={24} fill={isInWishlist ? "currentColor" : "none"} />
                            </button>
                            <button className="border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                <Share2 size={24} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-100 rounded-lg">
                            <div className="text-center">
                                <Truck className="mx-auto mb-2 text-amber-600" size={32} />
                                <p className="text-sm font-semibold">Free Shipping</p>
                            </div>
                            <div className="text-center">
                                <Shield className="mx-auto mb-2 text-amber-600" size={32} />
                                <p className="text-sm font-semibold">Authentic</p>
                            </div>
                            <div className="text-center">
                                <RotateCcw className="mx-auto mb-2 text-amber-600" size={32} />
                                <p className="text-sm font-semibold">7-Day Return</p>
                            </div>
                        </div>

                        {/* Vendor Info - NEW! */}
                        {product.vendorId && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <User size={20} className="text-amber-600" />
                                    Sold by {product.vendorId.storeName || 'Vendor'}
                                </h3>
                                {product.vendorId.rating && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={i < Math.floor(product.vendorId.rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-gray-600">
                                            {product.vendorId.rating.toFixed(1)} vendor rating
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Origin Info */}
                        {product.origin && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <MapPin size={20} className="text-amber-600" />
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
                            {renderDescription()}
                        </div>

                        {/* Cultural Story - YOUR UNIQUE FEATURE! */}
                        {product.culturalStory && (
                            <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-6 rounded">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="text-amber-600" />
                                    Cultural Story
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {product.culturalStory}
                                </p>
                            </div>
                        )}

                        {/* Specifications - UPDATED to be dynamic */}
                        {renderSpecifications()}

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
                                            <span className="text-amber-600 mt-1">✓</span>
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

                {/* Reviews Section */}
                <div className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        {/* Review Summary & Form */}
                        <div className="p-8 lg:border-r border-gray-100 bg-gray-50/50">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Star className="text-amber-500 fill-amber-500" size={24} />
                                Customer Reviews
                            </h2>

                            {/* Aggregate Rating */}
                            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="text-5xl font-black text-gray-900 mb-2">
                                    {(product.rating || product.avgRating || 0).toFixed(1)}
                                </div>
                                <div className="flex justify-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i < Math.floor(product.rating || product.avgRating || 0)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-200'}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-500 font-medium">
                                    Based on {product.numReviews || product.reviewCount || 0} reviews
                                </p>
                            </div>

                            {/* Add Review Form */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const user = e.target.elements.user.value;
                                        const comment = e.target.elements.comment.value;
                                        handleReviewSubmit(product._id, { user, rating: reviewRating, comment });
                                        e.target.reset();
                                        setReviewRating(5);
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            name="user"
                                            placeholder="Your name"
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(i + 1)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setReviewRating(i + 1)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        size={28}
                                                        className={(hoverRating || reviewRating) > i
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-200'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
                                        <textarea
                                            name="comment"
                                            placeholder="Share your thoughts..."
                                            required
                                            rows="4"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
                                    >
                                        Post Review
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="p-8 lg:col-span-2 max-h-[800px] overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {product.reviews && product.reviews.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div
                                            key={review._id}
                                            className="bg-gray-50 rounded-2xl p-6 border border-transparent hover:border-amber-100 hover:bg-white hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {(review.user || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 leading-tight">
                                                            {review.user || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex mt-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={i < review.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-200'}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-400 font-medium bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                                    {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
                                        <p className="text-gray-500 text-lg font-medium">Be the first to share your experience!</p>
                                        <p className="text-gray-400">Your feedback helps others make better choices.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* AI Recommendations Section */}
                {(recommendations.length > 0 || recLoading) && (
                    <div className="mt-16">
                        <div className="flex items-center gap-2 mb-8">
                            <Sparkles className="text-orange-500" />
                            <h2 className="text-3xl font-bold text-gray-900">Complete Your Collection</h2>
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">AI Powered</span>
                        </div>

                        {recLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {recommendations.map((rec) => (
                                    <Link
                                        key={rec._id}
                                        to={`/products/${rec.slug}`}
                                        className="group"
                                        onClick={() => window.scrollTo(0, 0)}
                                    >
                                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={rec.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Product'}
                                                    alt={rec.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                                                        <Wand2 size={12} className="text-orange-500" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                    {rec.name}
                                                </h3>
                                                <p className="text-orange-600 font-bold mt-1 text-sm">
                                                    {formatPrice(rec.price)}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductItem;