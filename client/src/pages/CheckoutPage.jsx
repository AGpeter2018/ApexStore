import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal } from '../redux/slices/cartSlice';
import { checkout, selectOrderLoading, selectOrderError } from '../redux/slices/orderSlice';
import { Check, CreditCard, MapPin, Package } from 'lucide-react';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const loading = useSelector(selectOrderLoading);
    const error = useSelector(selectOrderError);

    const [currentStep, setCurrentStep] = useState(1);
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Nigeria'
    });
    const [paymentMethod, setPaymentMethod] = useState('paystack');
    const [notes, setNotes] = useState('');

    const shippingFee = 1500;
    const tax = cartTotal * 0.075;
    const total = cartTotal + shippingFee + tax;

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value
        });
    };

    const validateAddress = () => {
        const required = ['name', 'phone', 'street', 'city', 'state', 'zipCode'];
        for (let field of required) {
            if (!shippingAddress[field]) {
                alert(`Please fill in ${field}`);
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateAddress()) return;
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCheckout = async () => {
        const checkoutData = {
            shippingAddress,
            paymentMethod,
            notes
        };

        try {
            const result = await dispatch(checkout(checkoutData)).unwrap();

            // If payment method requires redirect (Paystack/Flutterwave)
            if (result.payment && result.payment.authorizationUrl) {
                console.log('Redirecting to Paystack:', result.payment.authorizationUrl);
                localStorage.setItem('pendingOrderId', result.order._id);
                window.location.href = result.payment.authorizationUrl;
            } else if (result.payment && result.payment.paymentLink) {
                console.log('Redirecting to Flutterwave:', result.payment.paymentLink);
                localStorage.setItem('pendingOrderId', result.order._id);
                window.location.href = result.payment.paymentLink;
            } else {
                // Cash on delivery - go to confirmation
                navigate(`/order-confirmation/${result.order._id}`);
            }
        } catch (err) {
            console.error('Checkout error:', err);
        }
    };

    const steps = [
        { number: 1, title: 'Shipping', icon: MapPin },
        { number: 2, title: 'Payment', icon: CreditCard },
        { number: 3, title: 'Review', icon: Package }
    ];

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1>Checkout</h1>

                {/* Progress Steps */}
                <div className="checkout-steps">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                        >
                            <div className="step-icon">
                                {currentStep > step.number ? (
                                    <Check size={20} />
                                ) : (
                                    <step.icon size={20} />
                                )}
                            </div>
                            <span className="step-title">{step.title}</span>
                        </div>
                    ))}
                </div>

                <div className="checkout-content">
                    <div className="checkout-form">
                        {/* Step 1: Shipping Address */}
                        {currentStep === 1 && (
                            <div className="form-section">
                                <h2>Shipping Address</h2>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={shippingAddress.name}
                                            onChange={handleAddressChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleAddressChange}
                                            placeholder="08012345678"
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingAddress.street}
                                            onChange={handleAddressChange}
                                            placeholder="123 Main Street"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            placeholder="Lagos"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleAddressChange}
                                            placeholder="Lagos"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Zip Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleAddressChange}
                                            placeholder="100001"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country *</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={shippingAddress.country}
                                            onChange={handleAddressChange}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="form-section">
                                <h2>Payment Method</h2>
                                <div className="payment-methods">
                                    <label className={`payment-option ${paymentMethod === 'paystack' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paystack"
                                            checked={paymentMethod === 'paystack'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-info">
                                            <strong>Paystack</strong>
                                            <span>Pay with card via Paystack</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'flutterwave' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="flutterwave"
                                            checked={paymentMethod === 'flutterwave'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-info">
                                            <strong>Flutterwave</strong>
                                            <span>Pay with card via Flutterwave</span>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash_on_delivery"
                                            checked={paymentMethod === 'cash_on_delivery'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-info">
                                            <strong>Cash on Delivery</strong>
                                            <span>Pay when you receive your order</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="form-group full-width">
                                    <label>Order Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any special instructions for your order?"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {currentStep === 3 && (
                            <div className="form-section">
                                <h2>Review Your Order</h2>

                                <div className="review-section">
                                    <h3>Shipping Address</h3>
                                    <p>
                                        {shippingAddress.name}<br />
                                        {shippingAddress.phone}<br />
                                        {shippingAddress.street}<br />
                                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                                        {shippingAddress.country}
                                    </p>
                                </div>

                                <div className="review-section">
                                    <h3>Payment Method</h3>
                                    <p>{paymentMethod.replace('_', ' ').toUpperCase()}</p>
                                </div>

                                <div className="review-section">
                                    <h3>Order Items</h3>
                                    {cartItems.map((item) => (
                                        <div key={item.product._id} className="review-item">
                                            <img src={item.image} alt={item.name} />
                                            <div className="item-details">
                                                <p>{item.name}</p>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                            <p className="item-price">₦{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                {error && (
                                    <div className="error-message">{error}</div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="checkout-actions">
                            {currentStep > 1 && (
                                <button onClick={handleBack} className="btn-secondary">
                                    Back
                                </button>
                            )}
                            {currentStep < 3 ? (
                                <button onClick={handleNext} className="btn-primary">
                                    Continue
                                </button>
                            ) : (
                                <button
                                    onClick={handleCheckout}
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₦{cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
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
                    </div>
                </div>
            </div>

            <style jsx>{`
                .checkout-page {
                    min-height: 80vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 40px 20px;
                }

                .checkout-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .checkout-container h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 30px;
                }

                .checkout-steps {
                    display: flex;
                    justify-content: center;
                    gap: 40px;
                    margin-bottom: 40px;
                    padding: 30px;
                    background: white;
                    border-radius: 16px;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    opacity: 0.5;
                    transition: all 0.3s;
                }

                .step.active {
                    opacity: 1;
                }

                .step-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    transition: all 0.3s;
                }

                .step.active .step-icon {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .step.completed .step-icon {
                    background: #4CAF50;
                    color: white;
                }

                .step-title {
                    font-weight: 600;
                    color: #666;
                }

                .step.active .step-title {
                    color: #667eea;
                }

                .checkout-content {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 30px;
                }

                .checkout-form {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                }

                .form-section h2 {
                    font-size: 24px;
                    margin-bottom: 20px;
                    color: #333;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #333;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .payment-methods {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .payment-option {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .payment-option:hover {
                    border-color: #667eea;
                    background: #f5f7ff;
                }

                .payment-option.selected {
                    border-color: #667eea;
                    background: #f5f7ff;
                }

                .payment-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .payment-info strong {
                    font-size: 16px;
                    color: #333;
                }

                .payment-info span {
                    font-size: 14px;
                    color: #666;
                }

                .review-section {
                    margin-bottom: 25px;
                    padding-bottom: 25px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .review-section:last-child {
                    border-bottom: none;
                }

                .review-section h3 {
                    font-size: 18px;
                    margin-bottom: 10px;
                    color: #333;
                }

                .review-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: #f9f9f9;
                    border-radius: 8px;
                    margin-bottom: 10px;
                }

                .review-item img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .item-details {
                    flex: 1;
                }

                .item-price {
                    font-weight: 700;
                    color: #667eea;
                }

                .checkout-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                    margin-top: 30px;
                }

                .btn-primary,
                .btn-secondary {
                    padding: 14px 30px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background: white;
                    color: #667eea;
                    border: 2px solid #667eea;
                }

                .btn-secondary:hover {
                    background: #f5f7ff;
                }

                .order-summary {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    height: fit-content;
                    position: sticky;
                    top: 100px;
                }

                .order-summary h3 {
                    font-size: 20px;
                    margin-bottom: 20px;
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

                .error-message {
                    background: #fee;
                    color: #c00;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                }

                @media (max-width: 968px) {
                    .checkout-content {
                        grid-template-columns: 1fr;
                    }

                    .order-summary {
                        position: static;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .checkout-steps {
                        gap: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;
