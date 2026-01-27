import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, selectCartItems, selectCartTotal, selectCartCount, selectCartLoading } from '../redux/slices/cartSlice';
import CartItem from '../components/CartItem';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

    const shippingFee = 1500;
    const tax = cartTotal * 0.075;
    const total = cartTotal + shippingFee + tax;

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="cart-page">
                    <div className="loading">Loading cart...</div>
                </div>
                <Footer />
            </>
        );
    }

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page">
                    <div className="empty-cart">
                        <ShoppingCart size={80} />
                        <h2>Your cart is empty</h2>
                        <p>Add some products to get started!</p>
                        <button onClick={() => navigate('/categories')} className="shop-btn">
                            Start Shopping
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="cart-page">
                <div className="cart-container">
                    <h1>Shopping Cart ({cartCount} items)</h1>

                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <CartItem key={item.product._id} item={item} />
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>₦{cartTotal.toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping Fee:</span>
                                <span>₦{shippingFee.toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>Tax (7.5%):</span>
                                <span>₦{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>₦{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>

                            <button onClick={handleCheckout} className="checkout-btn">
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </button>

                            <button onClick={() => navigate('/categories')} className="continue-shopping-btn">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            <style jsx>{`
                .cart-page {
                    min-height: 80vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 40px 20px;
                }

                .cart-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .cart-container h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 30px;
                }

                .cart-content {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 30px;
                }

                .cart-items {
                    display: flex;
                    flex-direction: column;
                }

                .cart-summary {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    height: fit-content;
                    position: sticky;
                    top: 100px;
                }

                .cart-summary h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 20px 0;
                    color: #333;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    font-size: 16px;
                    color: #666;
                }

                .summary-row.total {
                    font-size: 24px;
                    font-weight: 700;
                    color: #333;
                    margin-top: 10px;
                }

                .summary-divider {
                    height: 2px;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    margin: 20px 0;
                }

                .checkout-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .checkout-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .continue-shopping-btn {
                    width: 100%;
                    padding: 14px;
                    background: white;
                    color: #667eea;
                    border: 2px solid #667eea;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: all 0.2s;
                }

                .continue-shopping-btn:hover {
                    background: #f5f7ff;
                }

                .empty-cart {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 16px;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .empty-cart svg {
                    color: #ddd;
                    margin-bottom: 20px;
                }

                .empty-cart h2 {
                    font-size: 28px;
                    color: #333;
                    margin: 20px 0 10px 0;
                }

                .empty-cart p {
                    color: #666;
                    font-size: 16px;
                    margin-bottom: 30px;
                }

                .shop-btn {
                    padding: 14px 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .shop-btn:hover {
                    transform: translateY(-2px);
                }

                .loading {
                    text-align: center;
                    padding: 100px 20px;
                    font-size: 20px;
                    color: #667eea;
                }

                @media (max-width: 968px) {
                    .cart-content {
                        grid-template-columns: 1fr;
                    }

                    .cart-summary {
                        position: static;
                    }
                }
            `}</style>
        </>
    );
};

export default CartPage;
