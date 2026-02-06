import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { orderAPI } from '../../utils/api';
import { fetchOrderById, selectCurrentOrder, selectOrderLoading } from '../../redux/slices/orderSlice';
import {
    ArrowLeft, Package, MapPin, CreditCard, Truck, Calendar,
    CheckCircle, Clock, AlertCircle, ChevronLeft, ExternalLink,
    Download, Phone, User, Shield, Camera, Home, ShoppingBag 
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const CustomerOrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const order = useSelector(selectCurrentOrder);
    const loading = useSelector(selectOrderLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
    }, [id, dispatch]);

    const handleCancelOrder = async (isRefund = false) => {
        const action = isRefund ? 'request a refund for' : 'cancel';
        const reason = window.prompt(`Please provide a reason to ${action} this order:`);

        if (reason !== null) { // User didn't click Cancel
            if (window.confirm(`Are you sure you want to ${action} this order?`)) {
                try {
                    await orderAPI.cancelOrder(id, { reason });
                    alert(`Order ${isRefund ? 'refund requested' : 'cancelled'} successfully`);
                    // Refresh order logic by re-fetching
                    dispatch(fetchOrderById(id));
                } catch (error) {
                    console.error('Cancel error:', error);
                    alert(error.response?.data?.message || 'Failed to cancel order');
                }
            }
        }
    };

    const getStatusColorClass = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            processing: 'bg-blue-100 text-blue-700 border-blue-200',
            shipped: 'bg-purple-100 text-purple-700 border-purple-200',
            delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderTimeline = () => {
        const timeline = [
            { status: 'pending', label: 'Order Placed', date: order?.createdAt, icon: Package },
            { status: 'processing', label: 'Processing', date: order?.orderStatus === 'processing' ? order?.updatedAt : null, icon: Package },
            { status: 'shipped', label: 'Shipped', date: order?.orderStatus === 'shipped' ? order?.updatedAt : null, icon: Truck },
            { status: 'delivered', label: 'Delivered', date: order?.deliveredAt, icon: CheckCircle }
        ];

        const currentIndex = timeline.findIndex(t => t.status === order?.orderStatus);

        return timeline.map((item, index) => ({
            ...item,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    if (loading && !order) {
        return <LoadingSpinner />;
    }

    if (!order) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
                    <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-8">We couldn't find the order you're looking for. It may have been deleted or the ID is incorrect.</p>
                    <button onClick={() => navigate('/my-orders')} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200">
                        Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    const timeline = getOrderTimeline();

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/my-orders')}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-100 text-orange-600 rounded-2xl font-bold shadow-sm transition-all hover:bg-orange-50 hover:border-orange-200 active:scale-95"
                >
                    <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                    Back to Orders
                </button>

                {/* Header Information */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">Order Details</h1>
                            <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${getStatusColorClass(order.orderStatus)}`}>
                                {order.orderStatus}
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium">Order Number: <span className="text-orange-600 font-black">#{order.orderNumber}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-4 relative z-10">
                        {['pending', 'processing'].includes(order.orderStatus) && (
                            <button
                                onClick={() => handleCancelOrder(false)}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black border border-red-100 transition-all hover:bg-red-100 hover:shadow-lg hover:shadow-red-200/50 active:scale-95"
                            >
                                Cancel Order
                            </button>
                        )}
                        {['shipped', 'delivered'].includes(order.orderStatus) && (
                            <button
                                onClick={() => navigate(`/customer/disputes/open/${order._id}`)}
                                className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-200 transition-all hover:bg-orange-700 hover:shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                <AlertCircle size={20} />
                                Report / Refund
                            </button>
                        )}
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* Order Timeline Section */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3">
                        <Clock className="text-orange-500" size={24} />
                        Order Status Timeline
                    </h2>

                    <div className="relative flex flex-col md:flex-row justify-between gap-8">
                        {/* Connecting Line (Mobile: Vertical, Desktop: Horizontal) */}
                        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-100 md:hidden"></div>
                        <div className="absolute left-6 right-6 top-[23px] h-0.5 bg-slate-100 hidden md:block"></div>

                        {timeline.map((item, index) => (
                            <div key={index} className="relative z-10 flex md:flex-col items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${item.active ? 'bg-orange-600 text-white animate-pulse ring-4 ring-orange-100' :
                                    item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <item.icon size={22} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col md:items-center">
                                    <span className={`text-sm font-black uppercase tracking-wider ${item.active ? 'text-orange-600' : 'text-slate-900'}`}>{item.label}</span>
                                    {item.date && (
                                        <span className="text-[11px] font-bold text-slate-400 uppercase">{formatDate(item.date).split('at')[0]}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {order.trackingNumber && (
                        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-100 text-orange-600">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tracking Number</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{order.trackingNumber}</p>
                                </div>
                            </div>
                            <button className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                <ExternalLink size={18} />
                                Track Order
                            </button>
                        </div>
                    )}
                </div>

                {/* COD Instructions (Enhanced Section) */}
                {order.paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-8 shadow-xl shadow-orange-200 text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Cash on Delivery Instructions</h2>
                                    <p className="text-orange-50/80 font-medium">Please follow these steps for a smooth delivery</p>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6 mt-6">
                                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                                    <p className="text-xs font-black text-orange-100 uppercase tracking-widest mb-2">Step 1</p>
                                    <p className="font-bold text-lg">Prepare the exact amount of <span className="font-black">₦{order.total?.toLocaleString()}</span> in cash.</p>
                                </div>
                                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                                    <p className="text-xs font-black text-orange-100 uppercase tracking-widest mb-2">Step 2</p>
                                    <p className="font-bold text-lg text-white">Ensure someone is available at the address to receive and pay.</p>
                                </div>
                            </div>
                            <div className="mt-8 flex items-start gap-3 p-4 bg-orange-700/30 rounded-xl border border-white/10">
                                <AlertCircle size={20} className="shrink-0 text-orange-200" />
                                <p className="text-sm font-medium text-orange-100">Note: Our couriers do not carry change. For safety reasons, please ensure the amount is ready before arrival.</p>
                            </div>
                        </div>
                        {/* Decorative background icon */}
                        <CreditCard size={200} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <ShoppingBag className="text-orange-500" size={24} />
                                Order Items
                            </h3>
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item._id} className="group flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-orange-200 transition-all hover:shadow-lg hover:shadow-orange-100/50">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-inner bg-white shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left min-w-0">
                                            <h4 className="text-lg font-black text-slate-900 mb-1 truncate">{item.name}</h4>
                                            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-3">Qty: <span className="text-slate-900">{item.quantity}</span></p>
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                                <p className="text-slate-500 font-bold">₦{item.price?.toLocaleString()}/unit</p>
                                                <p className="text-xl font-black text-orange-600">₦{item.subtotal?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Section */}
                            <div className="mt-12 pt-8 border-t-2 border-slate-100 space-y-4">
                                <div className="flex justify-between items-center text-slate-500 font-bold px-4">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">₦{order.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 font-bold px-4">
                                    <span>Shipping Fee</span>
                                    <span className="text-slate-900">₦{order.shippingFee?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 font-bold px-4">
                                    <span>Tax (7.5%)</span>
                                    <span className="text-slate-900">₦{order.tax?.toLocaleString()}</span>
                                </div>
                                <div className="p-6 bg-orange-600 rounded-2xl flex justify-between items-center text-white shadow-xl shadow-orange-200">
                                    <span className="text-lg font-black uppercase tracking-widest">Grand Total</span>
                                    <span className="text-3xl font-black tracking-tight">₦{order.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-widest border-b pb-4 border-slate-100">Additional Notes</h3>
                                <p className="text-slate-600 font-medium leading-relaxed italic">"{order.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Address & Payment Info */}
                    <div className="space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center gap-3 mb-6 text-orange-500">
                                <MapPin size={24} />
                                <h3 className="text-lg font-black text-slate-900">Shipping Info</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Customer Reference</p>
                                    <p className="text-lg font-black text-slate-900 mb-1">{order.shippingAddress?.name}</p>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                                        <Phone size={14} className="text-orange-500" />
                                        <span>{order.shippingAddress?.phone}</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Delivery Location</p>
                                    <p className="text-slate-700 font-bold leading-relaxed">
                                        {order.shippingAddress?.street}<br />
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                        {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center gap-3 mb-6 text-orange-500">
                                <CreditCard size={24} />
                                <h3 className="text-lg font-black text-slate-900">Payment Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Method</span>
                                    <span className="font-black text-slate-900 uppercase tracking-tight">{order.paymentMethod?.replace('_', ' ')}</span>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</span>
                                    <span className={`px-4 py-1.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        order.paymentStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                {order.paidAt && (
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block mb-1">Authenticated At</span>
                                        <span className="font-black text-emerald-700 leading-none">{formatDate(order.paidAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Meta Dates */}
                        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-400/20 text-white overflow-hidden relative group">
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="text-orange-500" size={24} />
                                    <h3 className="text-lg font-black uppercase tracking-widest">Key Timeline</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Placed On</p>
                                        <p className="font-black text-lg">{formatDate(order.createdAt).split('at')[0]}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Last Update</p>
                                        <p className="font-black text-lg">{formatDate(order.updatedAt)}</p>
                                    </div>
                                    {order.deliveredAt && (
                                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Delivered On</p>
                                            <p className="font-black text-lg text-emerald-400">{formatDate(order.deliveredAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Package size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 transition-transform group-hover:rotate-0" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrderDetailPage;
