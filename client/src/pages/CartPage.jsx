import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, selectCartItems, selectCartTotal, selectCartCount, selectCartLoading } from '../redux/slices/cartSlice';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingCart, ArrowRight } from 'lucide-react';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const cartCount = useSelector(selectCartCount);
    const loading = useSelector(selectCartLoading);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.token) {
            dispatch(fetchCart());
        }
    }, [dispatch]);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const getDiscountInfo = (count, subtotal) => {
        let percentage = 0;
        let nextThreshold = 3;

        if (count >= 10) {
            percentage = 15;
            nextThreshold = null;
        } else if (count >= 6) {
            percentage = 10;
            nextThreshold = 10;
        } else if (count >= 3) {
            percentage = 5;
            nextThreshold = 6;
        }

        const amount = (subtotal * percentage) / 100;
        return { amount, percentage, nextThreshold };
    };

    const { amount: discountAmount, percentage: discountPercentage, nextThreshold } = getDiscountInfo(cartCount, cartTotal);
    const shippingFee = 1500;
    const discountedSubtotal = cartTotal - discountAmount;
    const tax = discountedSubtotal * 0.075;
    const total = discountedSubtotal + shippingFee + tax;

    if (loading) {
        return <LoadingSpinner />;
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[80vh] bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex items-center justify-center px-4 py-10">
                <div className="text-center p-12 bg-white rounded-2xl max-w-lg w-full mx-auto shadow-lg">
                    <ShoppingCart size={80} className="text-gray-300 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
                    <p className="text-gray-600 text-lg mb-8">Add some products to get started!</p>
                    <button
                        onClick={() => navigate('/categories')}
                        className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:-translate-y-1 transition-transform shadow-lg hover:shadow-indigo-500/30"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-[#fdfdfd] px-4 py-12 sm:py-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <ShoppingCart size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Your Bag <span className="text-gray-300 ml-2">{cartCount}</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
                    <div className="flex flex-col gap-6">
                        {cartItems.map((item) => (
                            <CartItem key={item.product._id} item={item} />
                        ))}
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit sticky top-24">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-400 font-bold uppercase tracking-wider text-sm">
                                <span>Subtotal</span>
                                <span className="text-gray-900">₦{cartTotal.toLocaleString()}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-black uppercase tracking-wider text-sm">
                                    <span>Bulk Savings ({discountPercentage}%)</span>
                                    <span>-₦{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-400 font-bold uppercase tracking-wider text-sm">
                                <span>Shipping Est.</span>
                                <span className="text-gray-900">₦{shippingFee.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between text-gray-400 font-bold uppercase tracking-wider text-sm">
                                <span>Estimated Tax</span>
                                <span className="text-gray-900">₦{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-indigo-500 to-purple-600 my-10 opacity-20"></div>

                        <div className="flex justify-between items-baseline mb-8">
                            <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Total Amount</span>
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                ₦{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {cartCount < 10 && (
                            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-8 group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                                <p className="text-sm font-bold text-slate-600 relative z-10 leading-relaxed">
                                    Add <span className="text-indigo-600 font-black underline decoration-indigo-200 decoration-4 underline-offset-4">{nextThreshold - cartCount} more item{nextThreshold - cartCount > 1 ? 's' : ''}</span> to unlock a
                                    <span className="text-indigo-600 font-black"> {nextThreshold === 6 ? '10%' : nextThreshold === 10 ? '15%' : '5%'} discount</span>!
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleCheckout}
                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 hover:shadow-indigo-200 active:scale-95"
                            >
                                Checkout Now
                                <ArrowRight size={16} strokeWidth={3} />
                            </button>

                            <button
                                onClick={() => navigate('/categories')}
                                className="w-full py-5 bg-white text-gray-400 border-2 border-gray-100 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:border-gray-200 hover:text-gray-600 transition-all active:scale-95"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
