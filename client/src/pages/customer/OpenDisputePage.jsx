import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { openDispute, resetDisputeStatus } from '../../redux/slices/disputeSlice';
import { fetchOrderById, selectCurrentOrder } from '../../redux/slices/orderSlice';
import { AlertCircle, ArrowLeft, Send, Upload, Shield } from 'lucide-react';

const OpenDisputePage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const order = useSelector(selectCurrentOrder);
    const { loading, error, success } = useSelector((state) => state.dispute);

    const [formData, setFormData] = useState({
        reason: 'item_not_received',
        description: '',
        evidence: []
    });

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderById(orderId));
        }
        return () => dispatch(resetDisputeStatus());
    }, [orderId, dispatch]);

    useEffect(() => {
        if (success) {
            alert('Your dispute has been opened successfully. An admin will review it shortly.');
            navigate('/disputes');
        }
    }, [success, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(openDispute({
            orderId,
            ...formData
        }));
    };

    if (!order && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold">Order not found</h2>
                    <button onClick={() => navigate('/my-orders')} className="mt-4 text-amber-600 hover:underline">
                        Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-8 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-amber-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-2">
                            <Shield size={32} className="opacity-90" />
                            <h1 className="text-3xl font-bold">Conflict Resolution Center</h1>
                        </div>
                        <p className="opacity-90">Please provide details about the issue with Order #{order?.orderNumber}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3">
                                <AlertCircle className="text-red-500" size={20} />
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Reason for Dispute
                                </label>
                                <select
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium appearance-none bg-gray-50"
                                >
                                    <option value="item_not_received">Item not received</option>
                                    <option value="damaged_item">Item arrived damaged</option>
                                    <option value="wrong_item">Received wrong item</option>
                                    <option value="quality_issue">Product quality issue</option>
                                    <option value="delivery_delayed">Significant delivery delay</option>
                                    <option value="return_refund">Return & Refund request</option>
                                    <option value="other">Other issue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Detailed Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    placeholder="Explain exactly what happened..."
                                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium bg-gray-50 placeholder:text-gray-400"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Evidence (Optional)
                                </label>
                                <div className="border-4 border-dashed border-gray-100 rounded-2xl p-12 text-center hover:border-amber-200 transition-colors cursor-pointer group bg-gray-50">
                                    <Upload className="mx-auto text-gray-300 group-hover:text-amber-500 mb-4 transition-colors" size={48} />
                                    <p className="text-gray-500 font-medium">Click to upload photos as evidence</p>
                                    <p className="text-gray-400 text-sm mt-2 font-medium">(JPEG, PNG up to 5MB each)</p>
                                    <input type="file" multiple className="hidden" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-amber-700 transition-all shadow-xl hover:shadow-amber-200 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Submit Dispute to Admin
                                        <Send size={24} />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-gray-500 mt-4 text-sm font-medium">
                                Our support team will review your claim and mediate between you and the vendor.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OpenDisputePage;
