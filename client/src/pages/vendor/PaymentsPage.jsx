import { useState, useEffect } from 'react';
import { vendorAPI, payoutAPI } from '../../utils/api';
import { DollarSign, CreditCard, Clock, CheckCircle, ArrowUpRight, Search, Filter, Wallet, Building2, AlertCircle } from 'lucide-react';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayouts: 0,
        totalTransactions: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bankDetailsForm, setBankDetailsForm] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        bankCode: ''
    });

    useEffect(() => {
        if (vendor?.bankDetails) {
            setBankDetailsForm({
                accountName: vendor.bankDetails.accountName || '',
                accountNumber: vendor.bankDetails.accountNumber || '',
                bankName: vendor.bankDetails.bankName || '',
                bankCode: vendor.bankDetails.bankCode || ''
            });
        }
    }, [vendor]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paymentsRes, payoutsRes, vendorRes] = await Promise.all([
                vendorAPI.getPayments(),
                payoutAPI.getPayouts(),
                vendorAPI.getMyVendor()
            ]);

            if (paymentsRes.data.success) {
                setPayments(paymentsRes.data.data.payments);
                setStats(paymentsRes.data.data.stats);
            }
            if (payoutsRes.data.success) {
                setPayouts(payoutsRes.data.data);
            }
            if (vendorRes.data.success) {
                setVendor(vendorRes.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments data:', error);
            setLoading(false);
        }
    };

    const handleUpdateBankDetails = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const { data } = await vendorAPI.updateMyVendor({ bankDetails: bankDetailsForm });
            if (data.success) {
                alert('Bank details updated successfully');
                setShowBankModal(false);
                fetchData();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update bank details');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestPayout = async (e) => {
        e.preventDefault();
        if (!payoutAmount || isNaN(payoutAmount) || parseFloat(payoutAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (parseFloat(payoutAmount) > vendor.balance) {
            alert('Insufficient balance');
            return;
        }

        try {
            setIsSubmitting(true);
            const { data } = await payoutAPI.requestPayout({ amount: parseFloat(payoutAmount) });
            if (data.success) {
                alert('Payout request submitted successfully');
                setShowPayoutModal(false);
                setPayoutAmount('');
                fetchData(); // Refresh balance and payout list
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit payout request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredPayments = payments.filter(p =>
        p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payments & Payouts</h1>
                        <p className="text-gray-500 mt-2">Manage your earnings and withdraw funds.</p>
                    </div>
                    <button
                        onClick={() => setShowPayoutModal(true)}
                        className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                    >
                        <Wallet size={20} />
                        Request Payout
                    </button>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-orange-100 font-medium">Available Balance</p>
                        <h2 className="text-5xl font-bold mt-1">{formatPrice(vendor?.balance)}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Total Sales</p>
                            <p className="text-xl font-bold mt-1">{formatPrice(stats.totalEarnings)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Pending</p>
                            <p className="text-xl font-bold mt-1">{formatPrice(stats.pendingPayouts)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Transactions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Order</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPayments.map((p) => (
                                            <tr key={p._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-bold text-gray-900">#{p.orderNumber}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(p.amount)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.paidAt)}</td>
                                                <td className="px-6 py-1 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${['delivered', 'completed'].includes(p.status) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payout History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Reference</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payouts.map((po) => (
                                            <tr key={po._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(po.amount)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(po.createdAt)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[120px]">{po.reference || '---'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${po.status === 'processed' ? 'bg-green-100 text-green-700' :
                                                        po.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {payouts.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No payout requests found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bank Details */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="font-bold text-gray-900">Bank Details</h3>
                            </div>
                            {vendor?.bankDetails?.accountNumber ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Number</p>
                                        <p className="font-bold text-gray-900 mt-1">{vendor.bankDetails.accountNumber}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Name</p>
                                        <p className="font-bold text-gray-900 mt-1">{vendor.bankDetails.accountName}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bank Name</p>
                                        <p className="font-bold text-gray-900 mt-1">{vendor.bankDetails.bankName}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowBankModal(true)}
                                        className="w-full py-2 text-sm text-blue-600 font-bold hover:underline"
                                    >
                                        Update details
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500 mb-4">You haven't added your bank details yet.</p>
                                    <button
                                        onClick={() => setShowBankModal(true)}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
                                    >
                                        Add Bank Details
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <div className="flex gap-3">
                                <AlertCircle className="text-orange-600 shrink-0" size={20} />
                                <div className="space-y-2">
                                    <p className="font-bold text-orange-900 text-sm">Payout Info</p>
                                    <p className="text-xs text-orange-700 leading-relaxed font-medium">
                                        Payouts are usually processed within 24-48 hours. Ensure your bank details are correct to avoid failed transfers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Payout</h2>
                        <form onSubmit={handleRequestPayout} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Withdraw</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                                    <input
                                        type="number"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Max available: <span className="font-bold">{formatPrice(vendor?.balance)}</span></p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account</span>
                                    <span className="text-xs text-blue-600 font-bold">Edit</span>
                                </div>
                                <p className="font-bold text-gray-900">{vendor?.bankDetails?.accountNumber || 'Check details'}</p>
                                <p className="text-xs text-gray-500">{vendor?.bankDetails?.bankName}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPayoutModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Bank Details Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowBankModal(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Bank Details</h2>
                            <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Search size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateBankDetails} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Account Name</label>
                                <input
                                    type="text"
                                    value={bankDetailsForm.accountName}
                                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountName: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                                <input
                                    type="text"
                                    value={bankDetailsForm.accountNumber}
                                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountNumber: e.target.value })}
                                    placeholder="0123456789"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                                <input
                                    type="text"
                                    value={bankDetailsForm.bankName}
                                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankName: e.target.value })}
                                    placeholder="Access Bank"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBankModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Details'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
