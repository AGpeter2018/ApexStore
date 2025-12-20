import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Filter, UserPlus, Edit, Ban, CheckCircle, XCircle } from 'lucide-react';

const UsersManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        role: '',
        isActive: '',
        search: ''
    });
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [filters.role, filters.isActive]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.role) params.append('role', filters.role);
            if (filters.isActive) params.append('isActive', filters.isActive);

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/users?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/users/stats`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStats(data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('User role updated successfully!');
            fetchUsers();
            setShowEditModal(false);
        } catch (error) {
            alert('Failed to update user role');
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/users/${userId}/deactivate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('User deactivated successfully!');
            fetchUsers();
        } catch (error) {
            alert('Failed to deactivate user');
        }
    };

    const handleVerifyUser = async (userId) => {
        if (!confirm('Are you sure you want to verify this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/users/${userId}/verify`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('User verified successfully!');
            fetchUsers();
        } catch (error) {
            alert('Failed to verify user');
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            vendor: 'bg-blue-100 text-blue-800',
            customer: 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const filteredUsers = users.filter(user => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-600 mt-2">Manage all users and their roles</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Users size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <CheckCircle size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Active Users</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
                            <p className="text-blue-100 text-sm mb-2">Vendors</p>
                            <p className="text-4xl font-bold">{stats.vendors}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
                            <p className="text-green-100 text-sm mb-2">Customers</p>
                            <p className="text-4xl font-bold">{stats.customers}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Roles</option>
                                <option value="customer">Customer</option>
                                <option value="vendor">Vendor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
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

                {/* Users Table */}
                {filteredUsers.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Verified</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role === 'seller' ? 'vendor' : user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isActive ? (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle size={16} />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600">
                                                        <XCircle size={16} />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isVerified ? (
                                                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                        <CheckCircle size={16} />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-gray-400">
                                                        <XCircle size={16} />
                                                        Not verified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Edit Role"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    {!user.isVerified && (
                                                        <button
                                                            onClick={() => handleVerifyUser(user._id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Verify User"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {user.isActive && (
                                                        <button
                                                            onClick={() => handleDeactivateUser(user._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Deactivate"
                                                        >
                                                            <Ban size={18} />
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
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Users size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
                        <p className="text-gray-600">Try adjusting your filters</p>
                    </div>
                )}

                {/* Edit Role Modal */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User Role</h3>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-2">User: <span className="font-semibold text-gray-900">{editingUser.name}</span></p>
                                <p className="text-gray-600 mb-4">Email: <span className="font-semibold text-gray-900">{editingUser.email}</span></p>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select New Role
                                </label>
                                <select
                                    defaultValue={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleUpdateRole(editingUser._id, editingUser.role)}
                                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                                >
                                    Update Role
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingUser(null);
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersManagementPage;
