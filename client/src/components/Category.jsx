import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, TrendingUp, Search } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('all'); // 'all', 'main', 'hierarchy'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [viewMode]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            let endpoint = `${import.meta.env.VITE_API_URL}/categories`;

            // Adjust endpoint based on view mode
            if (viewMode === 'main') {
                endpoint = `${import.meta.env.VITE_API_URL}/categories?parentId=null`;
            } else if (viewMode === 'hierarchy') {
                endpoint = `${import.meta.env.VITE_API_URL}/categories?includeSubcategories=true&parentId=null`;
            }

            const { data } = await axios.get(endpoint);
            setCategories(data.data);
            setFilteredCategories(data.data);
            setLoading(false);
            setError('');
            console.log('Fetched categories:', data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);

        if (!value.trim()) {
            setFilteredCategories(categories);
            setError('');
            return;
        }

        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(value.toLowerCase()) ||
            category.description?.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredCategories(filtered);

        if (filtered.length === 0) {
            setError("No matching categories found.");
        } else {
            setError("");
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <main className="container mx-auto px-4 py-8 flex-grow">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
                <p className="text-gray-600">
                    Discover authentic Nigerian products across multiple categories
                </p>
            </div>

            {/* View Mode Toggle */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setViewMode('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'all'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Categories
                </button>
                <button
                    onClick={() => setViewMode('main')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'main'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Main Categories
                </button>
                <button
                    onClick={() => setViewMode('hierarchy')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'hierarchy'
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    With Subcategories
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Categories Display */}
            {viewMode === 'hierarchy' ? (
                // ===== HIERARCHICAL VIEW (Main + Subcategories) =====
                <div className="space-y-8">
                    {filteredCategories.map((category) => (
                        <div key={category._id} className="bg-white rounded-lg shadow-lg p-6">
                            {/* Main Category Header */}
                            <Link to={`/categories/${category.slug}`}>
                                <div className="flex items-center gap-4 mb-4 group cursor-pointer">
                                    <img
                                        src={category.categoryImage?.url || 'https://via.placeholder.com/100'}
                                        alt={category.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold group-hover:text-amber-600 transition">
                                            {category.name}
                                        </h2>
                                        <p className="text-gray-600">{category.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Package size={16} />
                                                {category.stats?.productCount || 0} products
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-amber-600 transition" />
                                </div>
                            </Link>

                            {/* Subcategories Grid */}
                            {category.subcategories && category.subcategories.length > 0 && (
                                <div className="ml-6 mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {category.subcategories.map((subcat) => (
                                        <Link
                                            key={subcat._id}
                                            to={`/categories/${subcat.slug}`}
                                            className="group"
                                        >
                                            <div className="bg-gray-50 rounded-lg p-4 hover:bg-amber-50 hover:shadow-md transition">
                                                <img
                                                    src={subcat.categoryImage?.url || 'https://via.placeholder.com/80'}
                                                    alt={subcat.name}
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                />
                                                <h3 className="font-semibold text-sm group-hover:text-amber-600 transition">
                                                    {subcat.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {subcat.stats?.productCount || 0} items
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // ===== GRID VIEW (All or Main Only) =====
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.map((category) => (
                        <Link to={`/categories/${category.slug}`} key={category._id}>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                                {/* Category Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={category.categoryImage?.url || 'https://via.placeholder.com/400'}
                                        alt={category.categoryImage?.alt || category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />

                                    {/* Featured Badge */}
                                    {category.featured && (
                                        <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <TrendingUp size={14} />
                                            Featured
                                        </div>
                                    )}
                                </div>

                                {/* Category Info */}
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-2 group-hover:text-amber-600 transition">
                                        {category.name}
                                    </h2>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {category.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Package size={16} />
                                            {category.stats?.productCount || 0} products
                                        </span>
                                        {category.level === 1 && (
                                            <span className="text-amber-600 font-medium">
                                                Main Category
                                            </span>
                                        )}
                                    </div>

                                    {/* View Button */}
                                    <div className="flex items-center text-amber-600 font-semibold group-hover:gap-2 transition-all">
                                        Browse Products
                                        <ChevronRight
                                            className="group-hover:translate-x-1 transition-transform"
                                            size={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredCategories.length === 0 && !error && (
                <div className="text-center py-12">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No categories available yet.</p>
                    <p className="text-gray-400 text-sm">Check back soon for new categories!</p>
                </div>
            )}
        </main>
    );
};

export default Categories;


