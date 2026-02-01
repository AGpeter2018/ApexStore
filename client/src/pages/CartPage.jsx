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
        <div className="min-h-[80vh] bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] px-4 py-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({cartCount} items)</h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                    <div className="flex flex-col gap-4">
                        {cartItems.map((item) => (
                            <CartItem key={item.product._id} item={item} />
                        ))}
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg h-fit sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Subtotal:</span>
                            <span>₦{cartTotal.toLocaleString()}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between mb-4 text-emerald-600 font-bold">
                                <span>Bulk Savings ({discountPercentage}%):</span>
                                <span>-₦{discountAmount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Shipping Fee:</span>
                            <span>₦{shippingFee.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Tax (7.5%):</span>
                            <span>₦{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-indigo-500 to-purple-600 my-6"></div>

                        <div className="flex justify-between mb-6 text-2xl font-bold text-gray-800">
                            <span>Total:</span>
                            <span>₦{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>

                        {cartCount < 10 && (
                            <div className="bg-green-50 border border-dashed border-green-500 p-3 rounded-lg mb-4 text-center text-sm text-green-800">
                                <p>
                                    Add <strong>{nextThreshold - cartCount} more item{nextThreshold - cartCount > 1 ? 's' : ''}</strong> to unlock
                                    <strong> {nextThreshold === 6 ? '10%' : nextThreshold === 10 ? '15%' : '5%'} off</strong>!
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-indigo-500/30 mb-4"
                        >
                            Proceed to Checkout
                            <ArrowRight size={20} />
                        </button>

                        <button
                            onClick={() => navigate('/categories')}
                            className="w-full py-3.5 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
