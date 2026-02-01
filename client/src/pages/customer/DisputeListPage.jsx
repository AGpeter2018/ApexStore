import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchDisputes } from '../../redux/slices/disputeSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Shield, AlertTriangle, CheckCircle, Clock, ChevronRight, MessageSquare, ArrowRight } from 'lucide-react';

const DisputeListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading, error } = useSelector((state) => state.dispute);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        dispatch(fetchDisputes());
    }, [dispatch]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle className="text-green-500" size={20} />;
            case 'under_review': return <AlertTriangle className="text-orange-500" size={20} />;
            case 'open': return <Clock className="text-blue-500" size={20} />;
            default: return <Clock className="text-gray-500" size={20} />;
        }
    };

    const getStatusStyles = (status) => {
        const styles = {
            open: 'bg-blue-50 text-blue-700 border-blue-100',
            vendor_responded: 'bg-purple-50 text-purple-700 border-purple-100',
            under_review: 'bg-orange-50 text-orange-700 border-orange-100',
            resolved: 'bg-green-50 text-green-700 border-green-100',
            cancelled: 'bg-gray-50 text-gray-700 border-gray-100'
        };
        return styles[status] || styles.open;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            <Shield className="text-amber-600" size={36} />
                            Dispute Center
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            {user.role === 'admin'
                                ? 'Review and mediate platform conflicts'
                                : user.role === 'vendor'
                                    ? 'Manage customer claims and provide information'
                                    : 'Track the status of your reported issues'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner fullPage={false} />
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200 shadow-sm">
                        <Shield size={64} className="mx-auto text-gray-200 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No disputes found</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Everything looks good! No active conflicts require your attention right now.</p>
                        <Link to={`/${user.role}`} className="inline-flex items-center gap-2 text-amber-600 font-bold hover:gap-3 transition-all">
                            Return to Dashboard <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {items.map((dispute) => (
                            <div
                                key={dispute._id}
                                onClick={() => navigate(`/disputes/${dispute._id}`)}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex gap-4 items-start">
                                        <div className={`p-4 rounded-xl ${getStatusStyles(dispute.status).split(' ')[0]} transition-transform group-hover:scale-110`}>
                                            {getStatusIcon(dispute.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-gray-900">Order #{dispute.order?.orderNumber}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 ${getStatusStyles(dispute.status)}`}>
                                                    {dispute.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 font-medium line-clamp-1">{dispute.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 font-bold">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={16} />
                                                    {formatDate(dispute.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MessageSquare size={16} />
                                                    {dispute.responses?.length || 0} messages
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                                        <p className="text-2xl font-black text-gray-900">
                                            ₦{dispute.order?.total?.toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-2 text-amber-600 font-black text-sm group-hover:gap-4 transition-all">
                                            VIEW CASE <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisputeListPage;
