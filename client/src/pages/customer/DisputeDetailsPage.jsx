import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDisputeById, respondToDispute, resolveDispute, resetDisputeStatus } from '../../redux/slices/disputeSlice';
import {
    Shield, ArrowLeft, Send, CheckCircle, AlertTriangle,
    User, Store, Calendar, MessageSquare, Gavel
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DisputeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentDispute: dispute, loading, error, success } = useSelector((state) => state.dispute);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [responseMessage, setResponseMessage] = useState('');
    const [adminAction, setAdminAction] = useState('full_refund');
    const [adminNote, setAdminNote] = useState('');
    const [refundAmount, setRefundAmount] = useState('');

    useEffect(() => {
        dispatch(fetchDisputeById(id));
        return () => dispatch(resetDisputeStatus());
    }, [id, dispatch]);

    useEffect(() => {
        if (success) {
            setResponseMessage('');
            setAdminNote('');
            dispatch(fetchDisputeById(id));
        }
    }, [success, id, dispatch]);

    const handleResponseSubmit = (e) => {
        e.preventDefault();
        if (!responseMessage.trim()) return;
        dispatch(respondToDispute({
            id,
            responseData: { message: responseMessage }
        }));
    };

    const handleResolveSubmit = (e) => {
        e.preventDefault();
        if (adminAction === 'partial_refund' && (!refundAmount || refundAmount <= 0)) {
            alert('Please specify a valid refund amount');
            return;
        }
        if (!window.confirm('Are you sure you want to finalize this decision? This action is binding and permanent.')) return;
        dispatch(resolveDispute({
            id,
            resolutionData: {
                action: adminAction,
                adminNote,
                refundAmount: adminAction === 'partial_refund' ? refundAmount : undefined
            }
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !dispute) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!dispute) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-8 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Disputes
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Dispute Info & Conversation */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Banner */}
                        <div className={`p-6 rounded-3xl border-2 shadow-sm flex items-center justify-between ${dispute.status === 'resolved'
                            ? 'bg-green-50 border-green-100'
                            : 'bg-amber-50 border-amber-100'
                            }`}>
                            <div className="flex items-center gap-4">
                                {dispute.status === 'resolved'
                                    ? <CheckCircle className="text-green-600" size={32} />
                                    : <AlertTriangle className="text-amber-600" size={32} />
                                }
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                        Case Status: {dispute.status.replace('_', ' ')}
                                    </h2>
                                    <p className="text-gray-600 font-medium">Resolution ID: {dispute._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            {dispute.status === 'resolved' && (
                                <div className="bg-green-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest">
                                    Resolved
                                </div>
                            )}
                        </div>

                        {/* Customer's Original Claim */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overlow-hidden">
                            <div className="flex items-center gap-2 mb-6 text-amber-600">
                                <Shield size={24} />
                                <h3 className="font-black text-xl uppercase tracking-tighter">Initial Support Request</h3>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                                <p className="text-2xl font-black text-gray-900 mb-2">"{dispute.reason.replace('_', ' ')}"</p>
                                <p className="text-gray-700 font-medium leading-relaxed">{dispute.description}</p>
                            </div>

                            {/* Evidence Images */}
                            {dispute.evidence?.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {dispute.evidence.map((img, i) => (
                                        <img key={i} src={img.url} alt="Evidence" className="w-full aspect-square object-cover rounded-xl border border-gray-100" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Conversation Thread */}
                        <div className="space-y-6">
                            <h3 className="font-black text-2xl text-gray-900 flex items-center gap-3">
                                <MessageSquare className="text-gray-400" size={24} />
                                Discussion Log
                            </h3>

                            <div className="space-y-6">
                                {dispute.responses?.map((res, i) => (
                                    <div key={i} className={`flex gap-4 ${res.user?.role === 'admin' ? 'justify-center' : ''}`}>
                                        <div className={`flex-1 p-6 rounded-3xl shadow-sm border ${res.user?.role === 'admin'
                                            ? 'bg-slate-900 text-white border-slate-800 text-center max-w-2xl mx-auto'
                                            : res.user?.role === 'vendor'
                                                ? 'bg-white border-blue-50'
                                                : 'bg-white border-amber-50'
                                            }`}>
                                            <div className={`flex items-center gap-2 mb-3 text-sm font-bold uppercase tracking-widest ${res.user?.role === 'admin' ? 'text-amber-400 justify-center' : 'text-gray-400'
                                                }`}>
                                                {res.user?.role === 'vendor' ? <Store size={14} /> : <User size={14} />}
                                                {res.user?.name} ({res.user?.role})
                                                <span className="mx-2">•</span>
                                                {formatDate(res.createdAt)}
                                            </div>
                                            <p className={`font-medium ${res.user?.role === 'admin' ? 'text-lg' : 'text-gray-700'}`}>
                                                {res.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {dispute.status !== 'resolved' && (
                                    <form onSubmit={handleResponseSubmit} className="mt-8">
                                        <div className="relative group">
                                            <textarea
                                                className="w-full p-6 pb-20 border-2 border-gray-100 rounded-3xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium bg-white shadow-xl placeholder:text-gray-300"
                                                placeholder="Write a message to the other parties..."
                                                rows="3"
                                                value={responseMessage}
                                                onChange={(e) => setResponseMessage(e.target.value)}
                                            ></textarea>
                                            <button
                                                type="submit"
                                                className="absolute bottom-4 right-4 bg-amber-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-amber-700 transition-all shadow-lg active:scale-95"
                                            >
                                                Send <Send size={18} />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Case Info & Admin Panel */}
                    <div className="space-y-8">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-black text-xl text-gray-900 mb-6 uppercase tracking-wider">Case Reference</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold text-sm uppercase">Order Number</span>
                                    <span className="font-black text-gray-900">#{dispute.order?.orderNumber}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold text-sm uppercase">Total Amount</span>
                                    <span className="font-black text-amber-600 text-xl">₦{dispute.order?.total?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold text-sm uppercase">Customer</span>
                                    <span className="font-bold text-gray-900">{dispute.customer?.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-400 font-bold text-sm uppercase">Vendor</span>
                                    <span className="font-bold text-gray-900">{dispute.vendor?.storeName || String(dispute.vendor?.name).split(' ')[0]}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/orders/${dispute.order?._id}`)}
                                className="w-full mt-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-600 font-black hover:bg-gray-50 hover:border-gray-200 transition-all text-sm uppercase tracking-widest"
                            >
                                View Full Order
                            </button>
                        </div>

                        {/* Admin Resolution Panel (Only for Admins and if not resolved) */}
                        {user.role === 'admin' && dispute.status !== 'resolved' && (
                            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-amber-500/20 p-2 rounded-lg">
                                        <Gavel className="text-amber-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl uppercase tracking-tighter">Admin Mediation</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Final Action Hub</p>
                                    </div>
                                </div>

                                <form onSubmit={handleResolveSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            Select Resolution Action
                                        </label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'full_refund', label: 'Full Refund', color: 'border-green-500 text-green-500 bg-green-500/10' },
                                                { id: 'partial_refund', label: 'Partial Refund', color: 'border-yellow-500 text-yellow-500 bg-yellow-500/10' },
                                                { id: 'deny_claim', label: 'Deny Claim', color: 'border-red-500 text-red-500 bg-red-500/10' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setAdminAction(opt.id)}
                                                    className={`p-4 rounded-xl border-2 font-black text-left transition-all ${adminAction === opt.id ? opt.color : 'border-slate-800 text-slate-400 hover:border-slate-700'
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>

                                        {adminAction === 'partial_refund' && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                    Partial Refund Amount (₦)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-amber-500 outline-none transition-all font-black text-amber-500 text-xl"
                                                    placeholder="Enter amount..."
                                                    value={refundAmount}
                                                    onChange={(e) => setRefundAmount(e.target.value)}
                                                    max={dispute.order?.total}
                                                    required
                                                />
                                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Max selectable: ₦{dispute.order?.total?.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            Official Ruling Note
                                        </label>
                                        <textarea
                                            className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-amber-500 outline-none transition-all font-medium text-white placeholder:text-slate-600"
                                            rows="4"
                                            placeholder="Explain the rationale for this decision..."
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-amber-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-amber-700 transition-all shadow-xl hover:shadow-amber-500/20 active:scale-[0.98]"
                                    >
                                        Finalize Resolution
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Showing the result if resolved */}
                        {dispute.status === 'resolved' && (
                            <div className="bg-white rounded-3xl p-8 border-4 border-green-500/10 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <CheckCircle size={120} className="text-green-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Gavel className="text-green-600" size={24} />
                                    </div>
                                    <h3 className="font-black text-xl text-gray-900 uppercase">Final Ruling</h3>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Decision</p>
                                        <p className="text-xl font-black text-green-600">{dispute.adminDecision?.action?.replace('_', ' ').toUpperCase()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rationale</p>
                                        <p className="text-gray-700 font-medium">{dispute.adminDecision?.note}</p>
                                    </div>
                                    {dispute.resolutionDetails?.refundAmount && (
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-xs font-bold text-amber-600 uppercase mb-1">Refunded Amount</p>
                                            <p className="text-xl font-black text-amber-700">₦{dispute.resolutionDetails.refundAmount.toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase">
                                        <Calendar size={14} />
                                        Decided on {formatDate(dispute.adminDecision?.decidedAt)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DisputeDetailsPage;
