import { useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderById, selectCurrentOrder, selectOrderLoading, verifyPayment } from '../redux/slices/orderSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, ShoppingBag, Truck, Calendar, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const OrderConfirmationPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const order = useSelector(selectCurrentOrder);
    const loading = useSelector(selectOrderLoading);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const reference = queryParams.get('reference');
        const trxref = queryParams.get('trxref');
        const transactionId = queryParams.get('transaction_id');


        const paymentRef = reference || trxref || transactionId;

        const handleVerification = async () => {
            if (!orderId) {
                console.warn('No order ID found in URL params');
                return;
            }


            try {
                if (paymentRef) {
                    await dispatch(verifyPayment({
                        orderId,
                        paymentData: {
                            reference: reference || trxref,
                            transactionId: transactionId
                        }
                    })).unwrap();

                    await dispatch(fetchOrderById(orderId)).unwrap();
                } else {
                    await dispatch(fetchOrderById(orderId)).unwrap();
                }
            } catch (error) {
                console.error('Verification/Fetch error:', error);
                try {
                    await dispatch(fetchOrderById(orderId)).unwrap();
                } catch (fetchError) {
                    console.error('Final fetch error:', fetchError);
                }
            }
        };

        handleVerification();
    }, [orderId, location.search, dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <LoadingSpinner />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
                <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 max-w-md w-full">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Package size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Order Not Found</h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed italic">
                        We couldn't retrieve the details for this order. It may be due to an expired session or incorrect URL.
                    </p>
                    <Link
                        to="/my-orders"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                    >
                        View My Orders
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Brand Logo */}
                <div className="flex justify-center mb-12">
                    <Logo size="md" />
                </div>

                {/* Success Banner */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 p-8 md:p-12 mb-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-indigo-100 opacity-20 pointer-events-none">
                        <Sparkles size={120} />
                    </div>

                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20"></div>
                        <div className="relative w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                            <CheckCircle size={56} strokeWidth={1.5} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                        Order <span className="text-indigo-600 tracking-normal">Confirmed</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed italic border-l-4 border-emerald-100 pl-6 text-left md:text-center md:border-l-0 md:pl-0 mb-8">
                        Thank you for choosing excellence. Your curated items are being prepared for delivery. A confirmation email has been sent to your registered address.
                    </p>

                    <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-2 rounded-3xl border border-gray-100">
                        <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Number</span>
                            <span className="text-indigo-600 font-black tracking-widest">{order.orderNumber}</span>
                        </div>
                        <div className="px-6 py-3 flex items-center gap-3">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag size={20} className="text-indigo-600" />
                                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Order Summary</h3>
                                </div>
                                <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {order.items?.length} {order.items?.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            <div className="p-8 space-y-6">
                                {order.items?.map((item) => (
                                    <div key={item._id} className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md ring-1 ring-gray-100 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h4 className="font-black text-gray-900 uppercase tracking-tight text-lg mb-1">{item.name}</h4>
                                            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                <span>Qty: {item.quantity}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>₦{item.price?.toLocaleString()} each</span>
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-indigo-600">
                                            ₦{item.subtotal?.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-indigo-50/30 p-8 border-t border-indigo-100">
                                <div className="space-y-4 max-w-sm ml-auto">
                                    <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span>₦{order.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600 italic">₦{order.shippingFee?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-wider">
                                        <span>Tax</span>
                                        <span>₦{order.tax?.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-indigo-200 flex justify-between items-center text-xl font-black text-gray-900 tracking-tighter uppercase">
                                        <span>Total</span>
                                        <span className="text-indigo-600 text-2xl">₦{order.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status Timeline/Info */}
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Truck size={20} className="text-indigo-600" />
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Logistics Status</h3>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                                        <p className={`font-black uppercase tracking-tight ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                                            }`}>
                                            {order.paymentStatus?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fullfillment</p>
                                        <p className="font-black text-gray-900 uppercase tracking-tight">
                                            {order.orderStatus?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Payment Info Sidebars */}
                    <div className="space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                                <MapPin size={20} className="text-indigo-600" />
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Shipping To</h3>
                            </div>
                            <div className="p-8">
                                <h4 className="font-black text-gray-900 uppercase tracking-tight mb-4">{order.shippingAddress?.name}</h4>
                                <div className="space-y-3 text-sm font-medium text-gray-500 leading-relaxed italic border-l-2 border-indigo-50 pl-4">
                                    <p>{order.shippingAddress?.phone}</p>
                                    <p>{order.shippingAddress?.street}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                    <p>{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                                <CreditCard size={20} className="text-indigo-600" />
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Payment</h3>
                            </div>
                            <div className="p-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Method</p>
                                <p className="font-black text-gray-900 uppercase tracking-tight text-lg mb-6">
                                    {order.paymentMethod?.replace('_', ' ')}
                                </p>

                                {/* Manual Verification Fallback */}
                                {order.paymentStatus !== 'paid' && order.paymentMethod !== 'cash_on_delivery' && (
                                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 leading-relaxed mb-4">
                                            If your payment didn't automatically verify, please use the button below to update status.
                                        </p>
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(location.search);
                                                const paymentData = {
                                                    reference: params.get('reference') || params.get('trxref'),
                                                    transactionId: params.get('transaction_id')
                                                };
                                                dispatch(verifyPayment({ orderId, paymentData })).unwrap()
                                                    .then(() => {
                                                        dispatch(fetchOrderById(orderId));
                                                        alert('Payment verified successfully!');
                                                    })
                                                    .catch((err) => alert('Verification failed: ' + (err.message || 'Unknown error')));
                                            }}
                                            className="w-full bg-amber-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95 shadow-md shadow-amber-100"
                                        >
                                            Verify Transaction
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Direct Actions */}
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/my-orders')}
                                className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                            >
                                Track My Orders
                                <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/categories')}
                                className="w-full bg-white text-indigo-600 border-2 border-indigo-600 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Polish */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-8 opacity-40">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authentic Artistry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Escrow Protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShieldCheck = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default OrderConfirmationPage;
