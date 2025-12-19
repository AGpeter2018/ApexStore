import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    Package,
    Search,
    Filter,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    Star
} from 'lucide-react';

const ProductsListPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, draft
    const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low-stock, out-of-stock
    const [featuredFilter, setFeaturedFilter] = useState('all'); // all, featured, not-featured
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const itemsPerPage = 20;
    
    // Sort
    const [sortBy, setSortBy] = useState('-createdAt'); // -createdAt, name, price, -price

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm, selectedCategory, statusFilter, stockFilter, featuredFilter, sortBy]);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
            setCategories(data.data || []);
            // console.log(data.data)
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                sort: sortBy
            });
            
            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory) params.append('categoryId', selectedCategory);
            
            // Status filtering
            if (statusFilter === 'active') {
                params.append('status', 'active');
                params.append('isActive', 'true');
            } else if (statusFilter === 'inactive') {
                params.append('isActive', 'false');
            } else if (statusFilter === 'draft') {
                params.append('status', 'draft');
            }
            
            // Stock filtering
            if (stockFilter === 'in-stock') {
                params.append('inStock', 'true');
            } else if (stockFilter === 'out-of-stock') {
                params.append('inStock', 'false');
            } else if (stockFilter === 'low-stock') {
                params.append('lowStock', 'true');
            }
            
            // Featured filtering
            if (featuredFilter === 'featured') {
                params.append('featured', 'true');
            } else if (featuredFilter === 'not-featured') {
                params.append('featured', 'false');
            }
            
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/products?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setProducts(data.data || []);
            setTotalPages(data.pages || 1);
            setTotalProducts(data.total || 0);
            setLoading(false);
            console.log(data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch products');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            setProducts(products.filter(p => p._id !== id));
            setDeleteConfirm(null);
            
            // Refresh if current page is empty
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchProducts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStockStatus = (stockQuantity) => {
        if (stockQuantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (stockQuantity <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setStatusFilter('all');
        setStockFilter('all');
        setFeaturedFilter('all');
        setCurrentPage(1);
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-2">
                            {totalProducts} total products
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to={`/${user.role}/product/add`}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <Plus size={20} />
                            Add Product
                        </Link>
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

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Filter size={20} />
                            Filters
                        </h3>
                        {(searchTerm || selectedCategory || statusFilter !== 'all' || stockFilter !== 'all' || featuredFilter !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                            </label>
                            <select
                                value={stockFilter}
                                onChange={(e) => {
                                    setStockFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Stock</option>
                                <option value="in-stock">In Stock</option>
                                <option value="low-stock">Low Stock</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Featured */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Featured
                            </label>
                            <select
                                value={featuredFilter}
                                onChange={(e) => {
                                    setFeaturedFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Products</option>
                                <option value="featured">Featured Only</option>
                                <option value="not-featured">Not Featured</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="createdAt">Oldest First</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="-name">Name (Z-A)</option>
                                <option value="price">Price (Low to High)</option>
                                <option value="-price">Price (High to Low)</option>
                                <option value="stockQuantity">Stock (Low to High)</option>
                                <option value="-stockQuantity">Stock (High to Low)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                {products.length > 0 ? (
                    <>
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {products.map((product) => {
                                            const stockStatus = getStockStatus(product.stockQuantity || product.stock || 0);
                                            return (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                                                {product.images?.[0]?.url ? (
                                                                    <img
                                                                        src={product.images[0].url}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="text-gray-400" size={20} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 line-clamp-1">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {product.sku || 'No SKU'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-gray-900 text-sm">
                                                                {product.categoryId?.name || 'Uncategorized'}
                                                            </p>
                                                            {product.subcategoryId && (
                                                                <p className="text-xs text-gray-500">
                                                                    {product.subcategoryId.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {formatPrice(product.price)}
                                                            </p>
                                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                                <p className="text-sm text-gray-500 line-through">
                                                                    {formatPrice(product.compareAtPrice)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stockStatus.color}`}>
                                                            {product.stockQuantity || product.stock || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color} inline-block w-fit`}>
                                                                {stockStatus.text}
                                                            </span>
                                                            {product.featured && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold text-yellow-700 bg-yellow-100 inline-block w-fit flex items-center gap-1">
                                                                    <Star size={12} fill="currentColor" />
                                                                    Featured
                                                                </span>
                                                            )}
                                                            {!product.isActive && (
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-200 inline-block w-fit">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                to={`/products/${product.slug}`}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View"
                                                            >
                                                                <Eye size={18} />
                                                            </Link>
                                                            <Link
                                                                to={`/${user.role}/products/edit/${product._id}`}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeleteConfirm(product._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = idx + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = idx + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + idx;
                                            } else {
                                                pageNum = currentPage - 2 + idx;
                                            }
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-4 py-2 rounded-lg font-medium ${
                                                        currentPage === pageNum
                                                            ? 'bg-orange-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || selectedCategory || statusFilter !== 'all' || stockFilter !== 'all'
                                ? 'No Products Found'
                                : 'No Products Yet'
                            }
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedCategory || statusFilter !== 'all' || stockFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start by adding your first product'
                            }
                        </p>
                        <Link
                            to={`/${user.role}/product/add`}
                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add Product
                        </Link>
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                                    <p className="text-gray-600">
                                        Are you sure you want to delete this product? This action cannot be undone.
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
            </div>
        </div>
    );
};

export default ProductsListPage;