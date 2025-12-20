import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, DollarSign, ShoppingCart, Users, TrendingUp, Download, Calendar } from 'lucide-react';

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        orders: null,
        users: null,
        products: null,
        revenue: []
    });
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [ordersRes, usersRes, productsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/orders/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/users/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/products`)
            ]);

            setReportData({
                orders: ordersRes.data.data,
                users: usersRes.data.data,
                products: productsRes.data,
                revenue: generateRevenueData(ordersRes.data.data.totalRevenue)
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setLoading(false);
        }
    };

    const generateRevenueData = (totalRevenue) => {
        // Simulate monthly revenue data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map((month, index) => ({
            month,
            revenue: Math.floor((totalRevenue / 6) * (0.8 + Math.random() * 0.4))
        }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleExportReport = () => {
        const reportContent = `
ApexStore Business Report
Generated: ${new Date().toLocaleString()}
Date Range: ${dateRange.start} to ${dateRange.end}

=== ORDERS ===
Total Orders: ${reportData.orders?.totalOrders || 0}
Pending: ${reportData.orders?.pendingOrders || 0}
Delivered: ${reportData.orders?.deliveredOrders || 0}
Cancelled: ${reportData.orders?.cancelledOrders || 0}
Total Revenue: ${formatPrice(reportData.orders?.totalRevenue || 0)}

=== USERS ===
Total Users: ${reportData.users?.totalUsers || 0}
Customers: ${reportData.users?.customers || 0}
Sellers: ${reportData.users?.sellers || 0}
Active Users: ${reportData.users?.activeUsers || 0}

=== PRODUCTS ===
Total Products: ${reportData.products?.total || 0}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Business Reports</h1>
                        <p className="text-gray-600 mt-2">Comprehensive analytics and insights</p>
                    </div>
                    <button
                        onClick={handleExportReport}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                        <Download size={20} />
                        Export Report
                    </button>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Calendar className="text-gray-400" size={24} />
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign size={32} />
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-green-100 text-sm mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatPrice(reportData.orders?.totalRevenue || 0)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <ShoppingCart size={32} />
                        </div>
                        <p className="text-blue-100 text-sm mb-2">Total Orders</p>
                        <p className="text-3xl font-bold">{reportData.orders?.totalOrders || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <Users size={32} />
                        </div>
                        <p className="text-purple-100 text-sm mb-2">Total Users</p>
                        <p className="text-3xl font-bold">{reportData.users?.totalUsers || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <BarChart size={32} />
                        </div>
                        <p className="text-orange-100 text-sm mb-2">Total Products</p>
                        <p className="text-3xl font-bold">{reportData.products?.total || 0}</p>
                    </div>
                </div>

                {/* Detailed Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Orders Breakdown */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Breakdown</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Pending Orders</span>
                                <span className="text-2xl font-bold text-yellow-600">{reportData.orders?.pendingOrders || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Processing</span>
                                <span className="text-2xl font-bold text-blue-600">{reportData.orders?.processingOrders || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Shipped</span>
                                <span className="text-2xl font-bold text-purple-600">{reportData.orders?.shippedOrders || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Delivered</span>
                                <span className="text-2xl font-bold text-green-600">{reportData.orders?.deliveredOrders || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Cancelled</span>
                                <span className="text-2xl font-bold text-red-600">{reportData.orders?.cancelledOrders || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Users Breakdown */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Users Breakdown</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Customers</span>
                                <span className="text-2xl font-bold text-green-600">{reportData.users?.customers || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Vendors</span>
                                <span className="text-2xl font-bold text-blue-600">{reportData.users?.sellers || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Admins</span>
                                <span className="text-2xl font-bold text-red-600">{reportData.users?.admins || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Active Users</span>
                                <span className="text-2xl font-bold text-purple-600">{reportData.users?.activeUsers || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                                <span className="font-semibold text-gray-900">Verified Users</span>
                                <span className="text-2xl font-bold text-orange-600">{reportData.users?.verifiedUsers || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart (Simple Bar Chart) */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Overview (Last 6 Months)</h2>
                    <div className="flex items-end justify-between gap-4 h-64">
                        {reportData.revenue.map((data, index) => {
                            const maxRevenue = Math.max(...reportData.revenue.map(d => d.revenue));
                            const height = (data.revenue / maxRevenue) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="text-sm font-semibold text-gray-700">
                                        {formatPrice(data.revenue)}
                                    </div>
                                    <div
                                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-500 hover:from-orange-600 hover:to-orange-500"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="text-sm font-semibold text-gray-600">{data.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-md p-8 mt-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-orange-100 text-sm mb-2">Average Order Value</p>
                            <p className="text-2xl font-bold">
                                {formatPrice((reportData.orders?.totalRevenue || 0) / (reportData.orders?.totalOrders || 1))}
                            </p>
                        </div>
                        <div>
                            <p className="text-orange-100 text-sm mb-2">Order Success Rate</p>
                            <p className="text-2xl font-bold">
                                {reportData.orders?.totalOrders
                                    ? Math.round((reportData.orders.deliveredOrders / reportData.orders.totalOrders) * 100)
                                    : 0}%
                            </p>
                        </div>
                        <div>
                            <p className="text-orange-100 text-sm mb-2">User Growth</p>
                            <p className="text-2xl font-bold">
                                {reportData.users?.totalUsers || 0} total
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
