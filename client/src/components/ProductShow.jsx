import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft, Tag, Package, ShoppingCart, Filter,
    ChevronDown, Grid, List, Star
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';



const CategoryProducts = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters & Sorting
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
    const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        fetchCategoryProducts();
    }, [slug, selectedSubcategory, minPrice, maxPrice, inStock, sortBy, sortOrder, currentPage]);

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                sortBy,
                sortOrder
            });

            if (selectedSubcategory) params.append('subcategoryId', selectedSubcategory);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (inStock) params.append('inStock', 'true');

            // NEW: Updated endpoint to use category-specific route
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/products/category/${slug}?${params}`
            );

            setCategoryData(data.data);
            console.log('Fetched category products:', data.data);
            setLoading(false);
            setError('');

            // Update URL params
            setSearchParams(params);
        } catch (err) {
            setError(err.response?.data?.message || 'Category not found');
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

    const getStockBadge = (stock) => {
        const quantity = stock?.stockQuantity ?? stock?.stock ?? stock ?? 0;
        if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-500' };
        if (quantity <= 5) return { text: `Only ${quantity} left`, color: 'bg-orange-500' };
        return { text: 'In Stock', color: 'bg-green-500' };
    };

    const handleFilterChange = () => {
        setCurrentPage(1); // Reset to first page when filters change
        fetchCategoryProducts();
    };

    const clearFilters = () => {
        setSelectedSubcategory('');
        setMinPrice('');
        setMaxPrice('');
        setInStock(false);
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !categoryData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error || 'Category not found'}</p>
                </div>
                <Link to="/categories" className="text-amber-600 hover:underline mt-4 inline-block">
                    ← Back to Categories
                </Link>
            </div>
        );
    }

    const { category, products, subcategories, pagination } = categoryData;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
            {/* Breadcrumb */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider">
                            <Link to="/categories" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                Categories
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-indigo-600">{category.name}</span>
                        </div>
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest border border-indigo-100"
                        >
                            <Filter size={14} />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Header */}
            <div className="relative h-64 sm:h-80 bg-gray-900 group">
                <img
                    src={category.categoryImage?.url || category.collectionImage?.url}
                    alt={category.categoryImage?.alt || category.name}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-12">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 drop-shadow-md">{category.name}</h1>
                        <p className="text-sm sm:text-lg text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed mb-6">
                            {category.description}
                        </p>
                        <div className="flex justify-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-2xl flex items-center gap-3">
                                <Package className="text-indigo-300" size={20} />
                                <span className="text-white font-black uppercase tracking-widest text-xs">
                                    {pagination?.total || products.length} Products
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar (Desktop) & Drawer (Mobile) */}
                    <aside className={`
                        fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none lg:z-0 lg:opacity-100
                        ${showMobileFilters ? 'opacity-100 visible' : 'opacity-0 invisible lg:visible'}
                    `}>
                        <div className={`
                            absolute right-0 top-0 h-full w-[85%] max-w-xs bg-white p-8 transition-transform duration-500 lg:relative lg:inset-auto lg:h-auto lg:w-64 lg:p-6 lg:rounded-3xl lg:shadow-sm lg:border lg:border-gray-100 lg:translate-x-0 lg:sticky lg:top-24
                            ${showMobileFilters ? 'translate-x-0' : 'translate-x-full'}
                        `}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-gray-900 text-lg uppercase tracking-widest flex items-center gap-2">
                                    <Filter size={20} className="text-indigo-600" />
                                    Filters
                                </h3>
                                <div className="flex items-center gap-4">
                                    {(selectedSubcategory || minPrice || maxPrice || inStock) && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Subcategories Filter */}
                                {subcategories && subcategories.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                            Subcategory
                                        </label>
                                        <select
                                            value={selectedSubcategory}
                                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                                            className="w-full bg-gray-50 border border-transparent focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
                                        >
                                            <option value="">All Categories</option>
                                            {subcategories.map(sub => (
                                                <option key={sub._id} value={sub._id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Price Range */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                        Price Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="From"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full bg-gray-50 border border-transparent focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all placeholder:text-gray-300"
                                        />
                                        <input
                                            type="number"
                                            placeholder="To"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full bg-gray-50 border border-transparent focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                {/* In Stock Filter */}
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-gray-100 transition-colors">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${inStock ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200'
                                        }`}>
                                        {inStock && <Check size={14} strokeWidth={4} />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={inStock}
                                        onChange={(e) => setInStock(e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-black text-gray-700 uppercase tracking-wider">In Stock Only</span>
                                </label>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={() => {
                                        handleFilterChange();
                                        setShowMobileFilters(false);
                                    }}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
                                >
                                    Update Results
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Products Section */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    Showing {products.length} of {pagination?.total || products.length} products
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort Dropdown */}
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        setSortBy(field);
                                        setSortOrder(order);
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="createdAt-desc">Newest First</option>
                                    <option value="createdAt-asc">Oldest First</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A-Z</option>
                                    <option value="name-desc">Name: Z-A</option>
                                    <option value="rating-desc">Highest Rated</option>
                                </select>

                                {/* View Mode Toggle */}
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 hover:text-indigo-600'}`}
                                    >
                                        <Grid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 hover:text-indigo-600'}`}
                                    >
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {products.length > 0 ? (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
                                : 'space-y-6'
                            }>
                                {products.map((product) => {
                                    const stockBadge = getStockBadge(product);
                                    const discount = product.compareAtPrice && product.compareAtPrice > product.price
                                        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                                        : 0;
                                    const stockQuantity = product.stockQuantity ?? product.stock ?? 0;

                                    return (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className="group block"
                                        >
                                            <div className={`bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                                                }`}>
                                                {/* Product Image */}
                                                <div className={`relative overflow-hidden bg-gray-50 aspect-square ${viewMode === 'list' ? 'w-full sm:w-64' : 'w-full'
                                                    }`}>
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Product'}
                                                        alt={product.images?.[0]?.alt || product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />

                                                    {/* Badges */}
                                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                        {discount > 0 && (
                                                            <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-red-500/30 uppercase tracking-widest">
                                                                {discount}% OFF
                                                            </div>
                                                        )}
                                                        {stockQuantity > 0 && stockQuantity <= 5 && (
                                                            <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-orange-500/30 uppercase tracking-widest">
                                                                Low Stock
                                                            </div>
                                                        )}
                                                    </div>

                                                    {stockQuantity === 0 && (
                                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center p-4">
                                                            <span className="text-gray-900 font-black text-xs uppercase tracking-[0.2em] border-2 border-gray-900 px-4 py-2 rounded-xl">Sold Out</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                                    {/* Category Badge */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-black uppercase tracking-widest">
                                                            {product.subcategoryId?.name || product.categoryId?.name || 'Item'}
                                                        </span>
                                                    </div>

                                                    {/* Product Name */}
                                                    <h3 className="font-black text-gray-900 text-xl mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                                        {product.name}
                                                    </h3>

                                                    {/* Vendor Info */}
                                                    {product.vendorId && (
                                                        <div className="flex items-center gap-2 mb-4 group/vendor">
                                                            <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
                                                                <Tag size={10} className="text-indigo-400" />
                                                            </div>
                                                            <p className="text-xs text-gray-400 font-bold group-hover/vendor:text-indigo-400 transition-colors">
                                                                {product.vendorId.storeName}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-2xl font-black text-gray-900">
                                                                ₦{product.price.toLocaleString()}
                                                            </span>
                                                            {product.compareAtPrice > product.price && (
                                                                <span className="text-xs text-gray-400 font-bold line-through">
                                                                    ₦{product.compareAtPrice.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm sm:w-12 sm:h-12">
                                                            <ShoppingCart size={viewMode === 'list' ? 24 : 20} strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <Package size={64} className="mx-auto text-gray-200 mb-6" />
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">No Products Found</h3>
                                <p className="text-gray-400 font-bold">
                                    {selectedSubcategory || minPrice || maxPrice || inStock
                                        ? 'Try adjusting your filters to find what you\'re looking for.'
                                        : 'Check back soon for new arrivals!'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="mt-16 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>

                                <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm rotate-180"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Gallery Section (if available) */}
            {category.galleryImages && category.galleryImages.length > 0 && (
                <div className="bg-white py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Gallery</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {category.galleryImages.map((image, index) => (
                                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                                    <img
                                        src={image.url}
                                        alt={image.alt || `Gallery ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default CategoryProducts;