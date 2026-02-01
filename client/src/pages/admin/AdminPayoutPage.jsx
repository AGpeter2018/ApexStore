import { useState, useEffect } from 'react';
import { payoutAPI } from '../../utils/api';
import { CheckCircle, XCircle, Clock, DollarSign, User, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPayoutPage = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const { data } = await payoutAPI.getPayouts();
            if (data.success) {
                setPayouts(data.data);
                console.log(data.data)
            }
        } catch (error) {
            console.error('Error fetching payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (id, status) => {
        const reference = status === 'processed' ? prompt('Enter Payment Reference (optional):') : null;
        const errorMsg = status === 'failed' ? prompt('Enter reason for failure:') : null;

        if (status === 'failed' && !errorMsg) return;

        try {
            setProcessingId(id);
            const { data } = await payoutAPI.processPayout(id, {
                status,
                reference: reference || undefined,
                error: errorMsg || undefined
            });

            if (data.success) {
                setPayouts(prev => prev.map(p => p._id === id ? data.data : p));
                alert(`Payout marked as ${status}`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to process payout');
        } finally {
            setProcessingId(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'processed': return 'bg-green-100 text-green-700 border-green-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendor Payouts</h1>
                        <p className="text-gray-500 mt-2">Manage and process withdrawal requests from vendors.</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {payouts.filter(p => p.status === 'pending').length}
                                </p>
                                <p className="text-[10px] text-yellow-600 mt-1 font-bold italic">Requires action</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-xl">
                                <Clock size={24} className="text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Pending Amount</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                    {formatPrice(payouts.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0))}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <DollarSign size={24} className="text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Processed</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {formatPrice(payouts.filter(p => p.status === 'processed').reduce((acc, p) => acc + p.amount, 0))}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Bank Details</th>
                                    <th className="px-6 py-4">Requested On</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payouts.length > 0 ? payouts.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{p.vendor?.name}</p>
                                                    <p className="text-xs text-gray-500">{p.vendor?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {formatPrice(p.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p className="font-bold">{p.bankDetails?.bankName}</p>
                                                <p>{p.bankDetails?.accountNumber}</p>
                                                <p className="italic">{p.bankDetails?.accountName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(p.status)}`}>
                                                {p.status === 'pending' && <Clock size={12} />}
                                                {p.status === 'processed' && <CheckCircle size={12} />}
                                                {p.status === 'failed' && <XCircle size={12} />}
                                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                            </span>
                                            {p.error && (
                                                <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={p.error}>{p.error}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {p.status === 'pending' ? (
                                                <div className="flex justify-end gap-2 text-xs">
                                                    <button
                                                        onClick={() => handleProcessPayout(p._id, 'processed')}
                                                        disabled={processingId === p._id}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                    <button
                                                        onClick={() => handleProcessPayout(p._id, 'failed')}
                                                        disabled={processingId === p._id}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-xs italic">
                                                    Processed
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <DollarSign size={48} className="text-gray-200 mb-2" />
                                                <p>No payout requests found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPayoutPage;
