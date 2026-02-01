import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../utils/api';
import { TrendingUp, ShoppingBag, DollarSign, Package, ChevronRight, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await analyticsAPI.getVendorAnalytics();
            if (res.data.success) {
                setData(res.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
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

    const { revenueTrend = [], topProducts = [], overallStats = {} } = data || {};

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1000);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Store Analytics</h1>
                    <p className="text-gray-500 mt-2">Insights and performance metrics for your business.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(overallStats.totalSales)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{overallStats.totalOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatPrice(overallStats.totalOrders ? overallStats.totalSales / overallStats.totalOrders : 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Revenue Trend (Last 30 Days)</h3>
                            <BarChart3 className="text-gray-400" size={20} />
                        </div>
                        <div className="h-64 flex items-end gap-2 px-2">
                            {revenueTrend.length > 0 ? revenueTrend.map((day, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                    <div
                                        className="w-full bg-orange-500 rounded-t-sm transition-all group-hover:bg-orange-600"
                                        style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                                    >
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {formatPrice(day.revenue)}
                                        </div>
                                    </div>
                                    <div className="h-4 w-full border-t border-gray-100 mt-2"></div>
                                </div>
                            )) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                                    No sales data available for this period.
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Past 30 Days</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Top Performing Products</h3>
                            <Package className="text-gray-400" size={20} />
                        </div>
                        <div className="space-y-6">
                            {topProducts.map((product, idx) => (
                                <div key={product._id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</span>
                                        <span className="font-bold text-orange-600">{formatPrice(product.totalSales)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full"
                                            style={{ width: `${(product.totalSales / topProducts[0].totalSales) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        <span>{product.totalQuantity} Units Sold</span>
                                        <span>Rank #{idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                            {topProducts.length === 0 && (
                                <div className="text-center py-12 text-gray-400 italic">
                                    No product performance data yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
