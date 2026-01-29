import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, toggleWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { ShoppingCart, Heart, Trash2, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector((state) => state.wishlist);

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleRemove = (productId) => {
        dispatch(toggleWishlist(productId));
    };

    const handleAddToCart = async (productId) => {
        try {
            await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
            alert('✅ Added to cart successfully!');
        } catch (error) {
            alert( (error || 'Failed to add to cart'));
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading && items.length === 0) {
        return (
             <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" />
                My Wishlist ({items.length})
            </h1>

            {items.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Save items you love to find them easily later and stay updated on price drops.
                    </p>
                    <Link
                        to="/categories/"
                        className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-200"
                    >
                        Start Shopping
                        <ArrowRight size={20} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {items.map((product) => (
                        <div key={product._id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <Link to={`/products/slug/${product.slug}`}>
                                    <img
                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=Product'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </Link>
                                <button
                                    onClick={() => handleRemove(product._id)}
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {product.compareAtPrice > product.price && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        Sale
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-6 flex flex-col flex-grow">
                                <Link to={`/products/slug/${product.slug}`} className="block mb-2 hover:text-amber-600 transition-colors">
                                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{product.name}</h3>
                                </Link>
                                <p className="text-gray-500 text-sm mb-4">{product.vendorId?.storeName || 'Vendor'}</p>

                                <div className="mt-auto pt-4 flex flex-col gap-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            {product.compareAtPrice > product.price && (
                                                <span className="text-gray-400 line-through text-sm block">
                                                    {formatPrice(product.compareAtPrice)}
                                                </span>
                                            )}
                                            <span className="text-2xl font-black text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(product._id)}
                                        disabled={product.stockQuantity === 0}
                                        className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${product.stockQuantity === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-amber-200'
                                            }`}
                                    >
                                        <ShoppingCart size={20} />
                                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
