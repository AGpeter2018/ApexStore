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
                <Link to="/categories" className="text-secondary-600 hover:text-indigo-600 hover:underline mt-4 inline-block font-bold">
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
                        <Link to="/categories" className="hover:text-indigo-600 transition-colors">Categories</Link>
                        <span>/</span>

                        {/* Main Category */}
                        {product.categoryId && (
                            <>
                                <Link
                                    to={`/categories/${product.categoryId.slug}`}
                                    className="hover:text-indigo-600 transition-colors"
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
                                    className="hover:text-indigo-600 transition-colors"
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
                                    className="hover:text-indigo-600 transition-colors"
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
                                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                                            ? 'border-indigo-600 shadow-xl shadow-indigo-100'
                                            : 'border-gray-100 hover:border-indigo-200 hover:shadow-lg'
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
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                                {product.subcategoryId?.name ||
                                    product.categoryId?.name ||
                                    product.drumType ||
                                    'Product'}
                            </span>

                            {product.featured && (
                                <span className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-1.5">
                                    <Star size={12} fill="currentColor" className="text-emerald-500" />
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{product.name}</h1>

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

                        <div className="mb-8">
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-black text-gray-900 tracking-tight">
                                    {formatPrice(product.price)}
                                </span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-2xl text-gray-400 line-through font-medium">
                                            {formatPrice(product.compareAtPrice)}
                                        </span>
                                        <span className="bg-rose-500 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200">
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
                        <div className="mb-8">
                            {stockQuantity > 0 ? (
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${stockQuantity <= (product.lowStockThreshold || 5) ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'
                                        }`}></div>
                                    <span className={`text-sm font-black uppercase tracking-widest ${stockQuantity <= (product.lowStockThreshold || 5) ? 'text-orange-600' : 'text-emerald-600'
                                        }`}>
                                        {stockQuantity <= (product.lowStockThreshold || 5)
                                            ? `Only ${stockQuantity} left in stock!`
                                            : `${stockQuantity} items in stock`}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-rose-600">
                                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
                                    <span className="text-sm font-black uppercase tracking-widest">Out of Stock</span>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {stockQuantity > 0 && (
                            <div className="mb-8">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                    Select Quantity
                                </label>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all font-black text-gray-400 hover:text-indigo-600"
                                        >
                                            -
                                        </button>
                                        <span className="px-8 py-3 font-black text-gray-900 border-x-2 border-gray-100/50">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all font-black text-gray-400 hover:text-indigo-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                        Max available: {stockQuantity}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <button
                                onClick={handleAddToCart}
                                disabled={stockQuantity === 0 || adding}
                                className="flex-[3] bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:shadow-indigo-200"
                            >
                                <ShoppingCart size={22} strokeWidth={2.5} />
                                {adding ? 'Adding...' : stockQuantity === 0 ? 'Out of Stock' : 'Add to Bag'}
                            </button>
                            <div className="flex gap-4 flex-1">
                                <button
                                    onClick={handleToggleWishlist}
                                    className={`flex-1 rounded-2xl transition-all active:scale-95 flex items-center justify-center border-2 py-4 ${isInWishlist
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner'
                                        : 'border-gray-100 hover:border-indigo-200 text-gray-400 hover:text-indigo-600'
                                        }`}
                                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart size={22} fill={isInWishlist ? "currentColor" : "none"} strokeWidth={2.5} />
                                </button>
                                <button className="flex-1 border-2 border-gray-100 rounded-2xl hover:border-indigo-200 text-gray-400 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center py-4">
                                    <Share2 size={22} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-100 rounded-lg">
                            <div className="text-center group/feature">
                                <Truck className="mx-auto mb-2 text-indigo-600 group-hover/feature:scale-110 transition-transform" size={32} />
                                <p className="text-sm font-semibold">Free Shipping</p>
                            </div>
                            <div className="text-center group/feature">
                                <Shield className="mx-auto mb-2 text-indigo-600 group-hover/feature:scale-110 transition-transform" size={32} />
                                <p className="text-sm font-semibold">Authentic</p>
                            </div>
                            <div className="text-center group/feature">
                                <RotateCcw className="mx-auto mb-2 text-indigo-600 group-hover/feature:scale-110 transition-transform" size={32} />
                                <p className="text-sm font-semibold">7-Day Return</p>
                            </div>
                        </div>

                        {/* Vendor Info */}
                        {product.vendorId && (
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <User size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Verified Vendor</p>
                                        <h3 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            {product.vendorId.storeName || 'Vendor'}
                                        </h3>
                                    </div>
                                </div>
                                {product.vendorId.rating && (
                                    <div className="flex items-center gap-2">
                                        <Star size={16} fill="currentColor" className="text-yellow-400" />
                                        <span className="text-gray-400 font-bold text-sm tracking-tight">
                                            <span className="text-gray-900 mr-1">{product.vendorId.rating.toFixed(1)}</span>
                                            rating
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Origin Info */}
                        {product.origin && (
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <MapPin size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Crafted in Nigeria</p>
                                        <h3 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            {product.origin.city}, {product.origin.state}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Information Tabs */}
                <div className="mt-16">
                    <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100">
                        {/* Description */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-4">
                                <span className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-base">
                                    <Package size={20} />
                                </span>
                                Description
                            </h2>
                            {renderDescription()}
                        </div>

                        {/* Cultural Story - YOUR UNIQUE FEATURE! */}
                        {product.culturalStory && (
                            <div className="mb-12 bg-indigo-50/50 border border-indigo-100 p-8 rounded-[2rem] relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-4">
                                        <span className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                            <TrendingUp size={20} strokeWidth={3} />
                                        </span>
                                        Cultural Story
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                        {product.culturalStory}
                                    </p>
                                </div>
                                <Sparkles className="absolute -bottom-6 -right-6 text-indigo-500/10 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                            </div>
                        )}

                        {/* Specifications - UPDATED to be dynamic */}
                        {renderSpecifications()}

                        {/* Materials */}
                        {product.materials && product.materials.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-4">
                                    <span className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <Shield size={20} />
                                    </span>
                                    Materials Used
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {product.materials.map((material, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-50 text-gray-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100"
                                        >
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-4">
                                    <span className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <CheckCircle size={20} />
                                    </span>
                                    Features
                                </h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-sm tracking-tight text-gray-700">
                                            <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                                <CheckCircle size={14} strokeWidth={3} />
                                            </span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Care Instructions */}
                        {product.careInstructions && (
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest flex items-center gap-4">
                                    <span className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <RotateCcw size={20} />
                                    </span>
                                    Care Instructions
                                </h2>
                                <p className="text-gray-700 leading-relaxed font-medium bg-gray-50 p-8 rounded-3xl border border-gray-100 italic">
                                    "{product.careInstructions}"
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
                            <div className="mb-10 p-10 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">
                                        {(product.rating || product.avgRating || 0).toFixed(1)}
                                    </div>
                                    <div className="flex justify-center mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={22}
                                                className={i < Math.floor(product.rating || product.avgRating || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-100'}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Verified Feedback ({product.numReviews || product.reviewCount || 0})
                                    </p>
                                </div>
                                <Star size={100} className="absolute -bottom-10 -right-10 text-gray-50/50 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
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
                        <div className="p-10 lg:col-span-2 max-h-[800px] overflow-y-auto custom-scrollbar bg-white">
                            <div className="space-y-8">
                                {product.reviews && product.reviews.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div
                                            key={review._id}
                                            className="bg-gray-50/50 rounded-3xl p-8 border-2 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 group"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
                                                        {(review.user || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 leading-tight uppercase tracking-tight">
                                                            {review.user || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex mt-1.5 gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={i < review.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-100'}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                                    {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed font-medium italic text-lg px-2 border-l-4 border-indigo-100">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-gray-50/30 rounded-[2.5rem] border-4 border-dashed border-gray-100">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                            <Sparkles className="text-gray-200" size={40} />
                                        </div>
                                        <p className="text-gray-500 text-xl font-black uppercase tracking-widest">No reviews yet</p>
                                        <p className="text-gray-400 mt-2 font-medium">Be the first to share your experience with this piece.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* AI Recommendations Section */}
                {(recommendations.length > 0 || recLoading) && (
                    <div className="mt-24">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <Sparkles size={24} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Perfect Pairings</h2>
                        </div>

                        {recLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-100 rounded-[2rem]"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {recommendations.map((rec) => (
                                    <Link
                                        key={rec._id}
                                        to={`/products/${rec.slug}`}
                                        className="group"
                                        onClick={() => window.scrollTo(0, 0)}
                                    >
                                        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group-hover:-translate-y-2 border border-gray-100">
                                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                                <img
                                                    src={rec.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Product'}
                                                    alt={rec.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-gray-100">
                                                        <Sparkles size={14} className="text-indigo-600" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recommendation</p>
                                                <h3 className="font-black text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                    {rec.name}
                                                </h3>
                                                <p className="text-indigo-600 font-black mt-2 text-base">
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
