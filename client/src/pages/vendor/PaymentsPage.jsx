import { useState, useEffect } from 'react';
import { vendorAPI } from '../../utils/api';
import { DollarSign, CreditCard, Clock, CheckCircle, ArrowUpRight, Search, Filter } from 'lucide-react';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayouts: 0,
        totalTransactions: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await vendorAPI.getPayments();
            if (data.success) {
                setPayments(data.data.payments);
                setStats(data.data.stats);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payments & Earnings</h1>
                    <p className="text-gray-500 mt-2">Track your revenue and transaction history.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">Life Time</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatPrice(stats.totalEarnings)}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <Clock size={24} />
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">In Process</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Pending Payouts</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{formatPrice(stats.pendingPayouts)}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                <CreditCard size={24} />
                            </div>
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-wider">Count</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search order or customer..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <Filter size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((p) => (
                                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900">#{p.orderNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{p.customer?.name}</span>
                                                    <span className="text-xs text-gray-500">{p.customer?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(p.paidAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                                                    {p.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900">{formatPrice(p.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${['delivered', 'completed'].includes(p.status)
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-blue-100 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {['delivered', 'completed'].includes(p.status) ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                                    <ArrowUpRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <CreditCard size={48} className="text-gray-200 mb-4" />
                                                <p className="text-gray-500 font-medium">No transactions found</p>
                                                <p className="text-gray-400 text-sm mt-1">When you receive payments, they will appear here.</p>
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

export default PaymentsPage;
