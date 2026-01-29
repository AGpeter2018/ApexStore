import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { vendorAPI } from '../../utils/api';
import {
    Store,
    Search,
    Filter,
    Edit,
    Ban,
    CheckCircle,
    XCircle,
    TrendingUp,
    Package,
    DollarSign,
    MapPin,
    Calendar,
    AlertCircle,
    Star,
    Eye
} from 'lucide-react';

const VendorsManagementPage = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        isApproved: '',
        isActive: '',
        search: ''
    });
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);

    useEffect(() => {
        fetchVendors();
        fetchStats();
    }, [filters.isApproved, filters.isActive]);

    const fetchVendors = async () => {
        try {
            const { data } = await vendorAPI.getAllVendors();
            setVendors(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await vendorAPI.getVendorStats();
            setStats(data.data);
        } catch (error) {
            console.error('Error fetching vendor stats:', error);
        }
    };

    const handleUpdateStatus = async (vendorId, status) => {
        try {
            await vendorAPI.updateVendorStatus(vendorId, status);
            alert('Vendor status updated successfully!');
            fetchVendors();
            fetchStats();
            setShowStatusModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update vendor status');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = !filters.search ||
            vendor.storeName.toLowerCase().includes(filters.search.toLowerCase()) ||
            vendor.owner?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            vendor.owner?.email?.toLowerCase().includes(filters.search.toLowerCase());

        const matchesApproved = filters.isApproved === '' ||
            vendor.isApproved.toString() === filters.isApproved;

        const matchesActive = filters.isActive === '' ||
            vendor.isActive.toString() === filters.isActive;

        return matchesSearch && matchesApproved && matchesActive;
    });

    if (loading) {
        return (
              <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Vendor Management</h1>
                    <p className="text-gray-600 mt-2">Approve, monitor, and manage marketplace vendors</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Vendors */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Vendors</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVendors}</p>
                                </div>
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <Store size={32} className="text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Approval */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Pending Approval</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingApprovals}</p>
                                </div>
                                <div className="bg-yellow-100 p-4 rounded-lg">
                                    <AlertCircle size={32} className="text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Sales */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Sales</p>
                                    <p className="text-2xl font-bold text-green-600 mt-2">{formatPrice(stats.totalRevenue)}</p>
                                </div>
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <TrendingUp size={32} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Orders */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalOrders}</p>
                                </div>
                                <div className="bg-purple-100 p-4 rounded-lg">
                                    <Package size={32} className="text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Vendors</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by store name, owner, or email..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Approval Status</label>
                            <select
                                value={filters.isApproved}
                                onChange={(e) => setFilters({ ...filters, isApproved: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Active Status</label>
                            <select
                                value={filters.isActive}
                                onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Store</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Owner</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Performance</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <Store size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{vendor.storeName}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin size={12} />
                                                        {vendor.location || 'No location'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-gray-900 font-medium">{vendor.owner?.name}</p>
                                                <p className="text-sm text-gray-500">{vendor.owner?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <TrendingUp size={14} className="text-green-600" />
                                                    <span className="font-medium">{formatPrice(vendor.totalSales)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Package size={14} />
                                                    <span>{vendor.totalOrders} orders</span>
                                                    <span className="flex items-center gap-0.5 ml-2">
                                                        <Star size={12} className="text-yellow-400 fill-current" />
                                                        {vendor.rating}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {vendor.isApproved ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                                                        <CheckCircle size={14} /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-yellow-600 text-xs font-semibold">
                                                        <AlertCircle size={14} /> Pending Approval
                                                    </span>
                                                )}
                                                {vendor.isActive ? (
                                                    <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold">
                                                        <CheckCircle size={14} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold">
                                                        <XCircle size={14} /> Suspended
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/vendors/${vendor._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={20} />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedVendor(vendor);
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Manage Status"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                {!vendor.isApproved && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(vendor._id, { isApproved: true })}
                                                        className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Management Modal */}
                {showStatusModal && selectedVendor && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                                <h3 className="text-xl font-bold">Manage Vendor</h3>
                                <p className="text-white/80 text-sm mt-1">{selectedVendor.storeName}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Approval Status</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedVendor._id, { isApproved: true })}
                                            className={`py-2 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${selectedVendor.isApproved
                                                ? 'bg-green-50 border-green-600 text-green-700'
                                                : 'border-gray-200 hover:border-green-600'
                                                }`}
                                        >
                                            <CheckCircle size={18} /> Approved
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedVendor._id, { isApproved: false })}
                                            className={`py-2 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${!selectedVendor.isApproved
                                                ? 'bg-yellow-50 border-yellow-600 text-yellow-700'
                                                : 'border-gray-200 hover:border-yellow-600'
                                                }`}
                                        >
                                            <AlertCircle size={18} /> Pending
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Account Status</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(selectedVendor._id, { isActive: true })}
                                            className={`py-2 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${selectedVendor.isActive
                                                ? 'bg-blue-50 border-blue-600 text-blue-700'
                                                : 'border-gray-200 hover:border-blue-600'
                                                }`}
                                        >
                                            <CheckCircle size={18} /> Active
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedVendor._id, { isActive: false })}
                                            className={`py-2 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${!selectedVendor.isActive
                                                ? 'bg-red-50 border-red-600 text-red-700'
                                                : 'border-gray-200 hover:border-red-600'
                                                }`}
                                        >
                                            <Ban size={18} /> Suspended
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t flex justify-end">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorsManagementPage;
