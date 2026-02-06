import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal } from '../redux/slices/cartSlice';
import { checkout, selectOrderLoading, selectOrderError } from '../redux/slices/orderSlice';
import { Check, CreditCard, MapPin, Package, AlertCircle, ArrowRight } from 'lucide-react';

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
    const [showCodConfirmation, setShowCodConfirmation] = useState(false);

    const getDiscountInfo = (count, subtotal) => {
        let percentage = 0;
        if (count >= 10) percentage = 15;
        else if (count >= 6) percentage = 10;
        else if (count >= 3) percentage = 5;

        const amount = (subtotal * percentage) / 100;
        return { amount, percentage };
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const { amount: discountAmount, percentage: discountPercentage } = getDiscountInfo(cartCount, cartTotal);
    const shippingFee = 1500;
    const discountedSubtotal = cartTotal - discountAmount;
    const tax = discountedSubtotal * 0.075;
    const total = discountedSubtotal + shippingFee + tax;

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

    const handleCheckout = async (forceCod = false) => {
        if (paymentMethod === 'cash_on_delivery' && !forceCod) {
            setShowCodConfirmation(true);
            return;
        }

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
        <div className="min-h-[80vh] bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] px-4 py-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 mb-8 sm:mb-12">Checkout</h1>

                {/* Progress Steps */}
                <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 sm:mb-12 bg-white p-4 sm:p-8 rounded-2xl shadow-sm">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className={`flex flex-col items-center gap-2 group transition-all duration-300 ${currentStep >= step.number ? 'opacity-100' : 'opacity-40'
                                }`}
                        >
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${currentStep > step.number
                                ? 'bg-emerald-500 text-white scale-95'
                                : currentStep === step.number
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-110 shadow-indigo-500/30'
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                {currentStep > step.number ? (
                                    <Check size={28} strokeWidth={3} />
                                ) : (
                                    <step.icon size={28} />
                                )}
                            </div>
                            <span className={`text-xs sm:text-sm font-black uppercase tracking-widest transition-colors ${currentStep >= step.number ? 'text-indigo-600' : 'text-gray-400'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm">
                        {/* Step 1: Shipping Address */}
                        {currentStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black text-gray-900 border-b pb-4">Shipping Address</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={shippingAddress.name}
                                            onChange={handleAddressChange}
                                            placeholder="John Doe"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleAddressChange}
                                            placeholder="08012345678"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingAddress.street}
                                            onChange={handleAddressChange}
                                            placeholder="123 Main Street"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            placeholder="Lagos"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleAddressChange}
                                            placeholder="Lagos"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Zip Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleAddressChange}
                                            placeholder="100001"
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Country *</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={shippingAddress.country}
                                            onChange={handleAddressChange}
                                            disabled
                                            className="w-full px-5 py-4 bg-gray-100 border-2 border-transparent rounded-xl font-medium text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black text-gray-900 border-b pb-4">Payment Method</h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'paystack', name: 'Paystack', desc: 'Secure card payment via Paystack' },
                                        { id: 'flutterwave', name: 'Flutterwave', desc: 'Secure card payment via Flutterwave' },
                                        { id: 'cash_on_delivery', name: 'Cash on Delivery (COD)', desc: 'Pay in cash at your doorstep. Please ensure exact change is available.' }
                                    ].map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === method.id
                                                ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-indigo-600' : 'border-gray-300'
                                                }`}>
                                                {paymentMethod === method.id && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                            </div>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="hidden"
                                            />
                                            <div className="flex-1">
                                                <strong className="block text-lg font-black text-gray-900 mb-1">{method.name}</strong>
                                                <span className="text-sm font-medium text-gray-500 leading-relaxed">{method.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="p-5 bg-amber-50 border-2 border-amber-100 rounded-2xl">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-amber-900 mb-1 leading-none uppercase tracking-wider text-xs">Information</p>
                                            <p className="text-sm font-bold text-amber-800 leading-relaxed">
                                                {paymentMethod === 'cash_on_delivery'
                                                    ? "You've selected Cash on Delivery. A delivery fee of ₦1,500 applies. Total to pay: ₦" + total.toLocaleString()
                                                    : "Secure payment via " + (paymentMethod === 'paystack' ? "Paystack" : "Flutterwave") + ". Your order will be processed immediately after payment."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Order Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any special instructions for your order?"
                                        rows="4"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl outline-none transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {currentStep === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black text-gray-900 border-b pb-4">Review Your Order</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                                        <div className="text-gray-900 font-bold leading-relaxed">
                                            <p className="text-lg">{shippingAddress.name}</p>
                                            <p className="text-indigo-600 mb-2">{shippingAddress.phone}</p>
                                            <p className="text-gray-600">{shippingAddress.street}</p>
                                            <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Payment Method</h3>
                                        <div className="flex items-center gap-3 text-lg font-black text-indigo-600">
                                            <CreditCard size={24} />
                                            {paymentMethod.replace(/_/g, ' ').toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Order Items</h3>
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div key={item.product._id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl group hover:border-indigo-200 transition-colors">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-sm text-gray-500 font-bold">Qty: {item.quantity} × ₦{item.price.toLocaleString()}</p>
                                                </div>
                                                <p className="font-black text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 font-bold text-center">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                            {currentStep > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    Continue
                                    <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:block">
                        <div className="bg-white p-8 rounded-2xl shadow-sm h-fit sticky top-24 border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-500 font-bold">
                                    <span>Subtotal</span>
                                    <span>₦{cartTotal.toLocaleString()}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-black">
                                        <span>Bulk Savings ({discountPercentage}%)</span>
                                        <span>-₦{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-500 font-bold">
                                    <span>Shipping</span>
                                    <span>₦{shippingFee.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between text-gray-500 font-bold">
                                    <span>Tax (7.5%)</span>
                                    <span>₦{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-indigo-500 to-purple-600 my-8"></div>

                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-gray-400 font-black uppercase tracking-widest text-sm">Total Amount</span>
                                <span className="text-4xl font-black text-gray-900">
                                    ₦{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <p className="text-xs text-center text-gray-400 font-bold mt-6 uppercase tracking-wider">
                                All transactions are secure and encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* COD Confirmation Modal */}
            {showCodConfirmation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="p-8 pb-4 text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-6 transform rotate-3">
                                <CreditCard size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Confirm COD Order</h2>
                            <p className="text-slate-500 font-medium">Please review the Cash on Delivery conditions before placing your order.</p>
                        </div>

                        {/* Conditions */}
                        <div className="p-8 pt-4 space-y-4">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 text-orange-600 font-black">1</div>
                                    <p className="text-slate-700 font-bold leading-relaxed">Prepare exact amount of <span className="text-orange-600 font-black">₦{total.toLocaleString()}</span> in cash.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 text-orange-600 font-black">2</div>
                                    <p className="text-slate-700 font-bold leading-relaxed text-sm">Our delivery agents do not carry change for safety reasons.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 text-orange-600 font-black">3</div>
                                    <p className="text-slate-700 font-bold leading-relaxed text-sm">Please ensure someone is available at the address to receive the package.</p>
                                </div>
                            </div>

                            <p className="text-xs text-center text-slate-400 font-bold uppercase tracking-widest px-4 leading-relaxed">
                                By clicking confirm, you agree to have the payment ready. Frequent cancellations of COD orders may lead to account restrictions.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="p-8 pt-0 flex flex-col gap-3">
                            <button
                                onClick={() => handleCheckout(true)}
                                disabled={loading}
                                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm & Place Order'}
                            </button>
                            <button
                                onClick={() => setShowCodConfirmation(false)}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CheckoutPage;
