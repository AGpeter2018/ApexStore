import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../utils/api';
import { TrendingUp, Users, ShoppingBag, DollarSign, Globe, ArrowUpRight, Loader2, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await analyticsAPI.getAdminAnalytics();
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching admin analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const { platformStats = {}, globalTrend = [], topVendors = [] } = data || {};
    const maxRev = Math.max(...globalTrend.map(d => d.revenue), 10000);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="text-orange-600" />
                        Platform Analytics
                    </h1>
                    <p className="text-gray-500 mt-2">Comprehensive overview of ApexStore performance.</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {/* Gross GMV */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Gross GMV</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(platformStats.totalGMV)}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <DollarSign size={24} className="text-orange-600" />
                            </div>
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Net Platform Balance</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{formatPrice(platformStats.netGMV)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">Remaining funds held</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl">
                                <TrendingUp size={24} className="text-orange-500" />
                            </div>
                        </div>
                    </div>

                    {/* Platform Earnings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Platform Earnings</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{formatPrice(platformStats.totalCommission)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">10% Platform Fee</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl">
                                <BarChart3 size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Payouts */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Payouts</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{formatPrice(data?.payouts?.processed)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{formatPrice(data?.payouts?.pending)} pending</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <ArrowUpRight size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Order Volume */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-600 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Order Volume</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{platformStats.totalOrders}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <ShoppingBag size={24} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Global Trend Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Platform Growth (Last 90 Days)</h3>
                            <TrendingUp className="text-green-500" size={20} />
                        </div>
                        <div className="h-64 flex items-end gap-1 px-2">
                            {globalTrend.map((day, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                    <div
                                        className="w-full bg-orange-600/20 group-hover:bg-orange-600/40 rounded-t-sm transition-all"
                                        style={{ height: `${(day.revenue / maxRev) * 100}%` }}
                                    >
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap">
                                            {formatPrice(day.revenue)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Vendors */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-orange-600" />
                            Top Vendors
                        </h3>
                        <div className="space-y-6">
                            {topVendors.map((vendor, idx) => (
                                <div key={vendor._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx < 3 ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{vendor.storeName}</p>
                                            <p className="text-xs text-gray-500">Sales: {vendor.totalOrders}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm text-orange-600">{formatPrice(vendor.totalSales)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
