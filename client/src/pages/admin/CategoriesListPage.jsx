import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryAPI } from '../../utils/api';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Layers,
    FolderTree,
    Search,
    Filter,
    Package,
    Star,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Download,
    Upload
} from 'lucide-react';

const CategoriesListPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ filteredCategories, setFilteredCategories] = useState([])
    const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'main', 'sub'
    const [showInactive, setShowInactive] = useState(false);


    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        filterCategoriesData();
    }, [categories, searchTerm, filterLevel, showInactive]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await categoryAPI.getCategories();
            setCategories(data.data || []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
            setLoading(false);
        }
    };

    const filterCategoriesData = () => {
        let filtered = [...categories];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(cat => 
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by level
        if (filterLevel === 'main') {
            filtered = filtered.filter(cat => !cat.parentId || cat.level === 1);
        } else if (filterLevel === 'sub') {
            filtered = filtered.filter(cat => cat.parentId && cat.level === 2);
        }

        // Filter by active status
        if (!showInactive) {
            filtered = filtered.filter(cat => cat.isActive);
        }

        setFilteredCategories(filtered);
    };

    // --- CHANGED: string-safe ID comparisons & subcategory check ---
    const handleDelete = async (id) => {
        try {
            // Check if category can be deleted
            const category = categories.find(c => String(c._id) === String(id));
            const hasProducts = category?.stats?.productCount > 0;
            const hasSubcategories = categories.some(c => String(c.parentId) === String(id));

            if (hasProducts) {
                alert(`Cannot delete category with ${ category.stats.productCount } products.Please move or delete products first.`)
                setDeleteConfirm(null)
                return;
            }

            if (hasSubcategories) {
                alert('Cannot delete category with subcategories. Please delete subcategories first.');
                setDeleteConfirm(null);
                return;
            }

            await axios.delete(`${ import.meta.env.VITE_API_URL } /categories/${ id } `, {
                headers: {
                    Authorization: `Bearer ${ token } `,
                }
            });
            
            setCategories(categories.filter(c => String(c._id) !== String(id)));
            setDeleteConfirm(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete category');
            setDeleteConfirm(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCategories.length === 0) return;
        
        if (confirm(`Delete ${ selectedCategories.length } category(ies) ? `)) {
            try {
                const results = await Promise.allSettled(
                    selectedCategories.map(id => 
                        axios.delete(`${ import.meta.env.VITE_API_URL } /categories/${ id } `, {
                            headers: {
                                Authorization: `Bearer ${ token } `
                            }
                        })
                    )
                );

                const failed = results.filter(r => r.status === 'rejected').length;
                
                if (failed > 0) {
                    alert(`${ failed } categories could not be deleted(may have products or subcategories)`);
                }

                await fetchCategories();
                setSelectedCategories([]);
            } catch (error) {
                alert('Failed to delete some categories');
            }
        }
    };

    // --- CHANGED: select uses string ids to avoid ObjectId mismatch ---
    const toggleSelectAll = () => {
        if (selectedCategories.length === filteredCategories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(filteredCategories.map(c => String(c._id)));
        }
    };

    const toggleSelect = (id) => {
        setSelectedCategories(prev => 
            prev.includes(String(id)) 
                ? prev.filter(cId => cId !== String(id))
                : [...prev, String(id)]
        );
    };

    // --- CHANGED: parent lookup uses string-safe compare, returns null if none ---
    const getParentName = (parentId) => {
        if (!parentId) return null;
        const parent = categories.find(c => String(c._id) === String(parentId));
        return parent ? parent.name : 'Unknown';
    };

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600 mt-2">Organize your marketplace catalog</p>
                    </div>
                    <Link
                        to="/admin/categories/add"
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus size={20} />
                        Add Category
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Categories</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {categories.length}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <Layers className="text-orange-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Main Categories</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {categories.filter(c => !c.parentId || c.level === 1).length}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Layers className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {categories.reduce((sum, cat) => sum + (cat.stats?.productCount || 0), 0)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Package className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Featured</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {categories.filter(c => c.featured).length}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Star className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter by Level */}
                        <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Levels</option>
                            <option value="main">Main Categories</option>
                            <option value="sub">Subcategories</option>
                        </select>

                        {/* Show Inactive Toggle */}
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Show Inactive</span>
                        </label>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedCategories.length > 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <span className="text-orange-800 font-semibold">
                            {selectedCategories.length} category(ies) selected
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear Selection
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Categories Grid */}
                {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCategories.map((category) => (
                            <div 
                                key={String(category._id)} 
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="relative">
                                    {/* Checkbox */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(String(category._id))}
                                            onChange={() => toggleSelect(String(category._id))}
                                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                        />
                                    </div>

                                    {/* Image with category colorTheme fallback */}
                                    <div
                                        className="h-48 overflow-hidden"
                                        style={{
                                            background: `linear - gradient(135deg, ${ category.colorTheme?.primary || '#FFEDD5' } 0 %, ${ category.colorTheme?.secondary || '#FEE2B3' } 100 %)`
                                        }}
                                    >
                                        {category.categoryImage?.url ? (
                                            <img
                                                src={category.categoryImage.url}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Layers className="text-orange-400" size={64} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                                        {category.featured && (
                                            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                                <Star size={12} fill="currentColor" />
                                                Featured
                                            </span>
                                        )}
                                        {!category.isActive && (
                                            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                Inactive
                                            </span>
                                        )}
                                        {category.level === 2 && (
                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                Subcategory
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5">
                                    {/* Category Name & Icon */}
                                    <div className="flex items-start gap-3 mb-3">
                                        {category.icon && (
                                            <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                                                <span className="text-orange-600 text-xl">{category.icon}</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {category.name}
                                            </h3>
                                            {category.parentId && (
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    {getParentName(category.parentId)}
                                                    <ChevronRight size={14} />
                                                    <span className="text-gray-700">{category.name}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {category.description || 'No description'}
                                    </p>

                                    {/* Stats: productCount, views, attrs, vendors, revenue */}
                                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <Package size={14} />
                                            {category.stats?.productCount || 0} products
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <TrendingUp size={14} />
                                            {category.stats?.viewCount || 0} views
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <Layers size={14} />
                                            {category.attributes?.length || 0} attrs
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <Package size={14} />
                                            {category.stats?.vendorCount || 0} vendors
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <TrendingUp size={14} />
                                            ₦{(category.stats?.totalRevenue || 0).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/ categories / ${ category.slug } `}
                                            className="flex-1 text-center py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                                        >
                                            <Eye size={16} />
                                            View
                                        </Link>
                                        <Link
                                            to={`/ admin / categories / edit / ${ category._id } `}
                                            className="flex-1 text-center py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(String(category._id))}
                                            className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Layers size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || filterLevel !== 'all' || !showInactive 
                                ? 'No Categories Found' 
                                : 'No Categories Yet'
                            }
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filterLevel !== 'all' || !showInactive
                                ? 'Try adjusting your filters'
                                : 'Start by creating your first category'
                            }
                        </p>
                        {!searchTerm && filterLevel === 'all' && (
                            <Link
                                to="/admin/categories/add"
                                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                            >
                                <Plus size={20} />
                                Add Category
                            </Link>
                        )}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <AlertCircle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h3>
                                    <p className="text-gray-600">
                                        Are you sure you want to delete this category? This action cannot be undone.
                                    </p>
                                    <p className="text-sm text-orange-600 mt-2">
                                        Note: Categories with products or subcategories cannot be deleted.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Select All Floating Button */}
                {filteredCategories.length > 0 && (
                    <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-xl p-4 border border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="font-semibold text-gray-700">Select All</span>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesListPage;
