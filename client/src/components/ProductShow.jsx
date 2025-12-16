// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { ChevronLeft, Tag, Package, ShoppingCart } from 'lucide-react';

// import Footer from './Footer';

// const ProductShow = () => {
//     const { slug } = useParams();
//     const [collectionData, setCollectionData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         fetchCollection();
//     }, [slug]);

//     const fetchCollection = async () => {
//         try {
//             const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/collections/${slug}`);
//             setCollectionData(data.data);
//             console.log('Fetched collection:', data.data);
//             setLoading(false);
//         } catch (err) {
//             setError(err.response?.data?.message || 'Collection not found');
//             setLoading(false);
//         }
//     };

//     const formatPrice = (price) => {
//         return new Intl.NumberFormat('en-NG', {
//             style: 'currency',
//             currency: 'NGN',
//             minimumFractionDigits: 0
//         }).format(price);
//     };

//     const getStockBadge = (stock) => {
//         if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-500' };
//         if (stock <= 5) return { text: 'Low Stock', color: 'bg-yellow-500' };
//         return { text: 'In Stock', color: 'bg-green-500' };
//     };

//        if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (error || !collectionData) {
//         return (
//             <div className="container mx-auto px-4 py-8">
//                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
//                     <p className="font-bold">Error</p>
//                     <p>{error || 'Collection not found'}</p>
//                 </div>
//                 <Link to="/collections" className="text-orange-600 hover:underline mt-4 inline-block">
//                     ← Back to Collections
//                 </Link>
//             </div>
//         );
//     }

//     const { collection, products } = collectionData;

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Breadcrumb */}
//             <div className="bg-white border-b">
//                 <div className="container mx-auto px-4 py-4">
//                     <Link 
//                         to="/collections" 
//                         className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
//                     >
//                         <ChevronLeft size={20} />
//                         Back to Collections
//                     </Link>
//                 </div>
//             </div>

//             {/* Collection Header */}
//             <div className="relative h-96 bg-gradient-to-r from-orange-600 to-red-600">
//                 <img
//                     src={collection.collectionImage?.url}
//                     alt={collection.collectionImage?.alt || collection.name}
//                     className="w-full h-full object-cover opacity-40"
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="text-center text-white">
//                         <h1 className="text-6xl font-bold mb-4">{collection.name}</h1>
//                         <p className="text-xl max-w-2xl mx-auto px-4">
//                             {collection.description}
//                         </p>
//                         <div className="mt-6 flex justify-center gap-4">
//                             <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
//                                 <Package className="inline mr-2" size={20} />
//                                 {products.length} {products.length === 1 ? 'Product' : 'Products'}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Products Grid */}
//             <div className="container mx-auto px-4 py-12">
//                 <h2 className="text-3xl font-bold text-gray-900 mb-8">
//                     Available Drums
//                 </h2>

//                 {products.length > 0 ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         {products.map((product) => {
//                             const stockBadge = getStockBadge(product.stock);
//                             const discount = product.compareAtPrice && product.compareAtPrice > product.price
//                                 ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
//                                 : 0;

//                             return (
//                                 <Link 
//                                     key={product._id} 
//                                     to={`/products/${product.slug}`}
//                                     className="group"
//                                 >
//                                     <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300">
//                                         {/* Product Image */}
//                                         <div className="relative h-64 overflow-hidden bg-gray-100">
//                                             <img
//                                                 src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Drum'}
//                                                 alt={product.images?.[0]?.alt || product.name}
//                                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                                             />
                                            
//                                             {/* Badges */}
//                                             <div className="absolute top-3 right-3 flex flex-col gap-2">
//                                                 {discount > 0 && (
//                                                     <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
//                                                         -{discount}%
//                                                     </div>
//                                                 )}
//                                             </div>
                                            
//                                             {product.stock === 0 && (
//                                                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                                                     <span className="text-white font-bold text-lg">Out of Stock</span>
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Product Info */}
//                                         <div className="p-4">
//                                             {/* Drum Type Badge */}
//                                             <div className="flex items-center gap-2 mb-2">
//                                                 <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
//                                                     {product.drumType}
//                                                 </span>
//                                                 <div className={`w-2 h-2 rounded-full ${stockBadge.color}`}></div>
//                                             </div>

//                                             {/* Product Name */}
//                                             <h3 className="font-bold text-lg mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
//                                                 {product.name}
//                                             </h3>

//                                             {/* Rating */}
//                                             {product.rating > 0 && (
//                                                 <div className="flex items-center gap-1 mb-3">
//                                                     <div className="flex">
//                                                         {[...Array(5)].map((_, i) => (
//                                                             <span 
//                                                                 key={i} 
//                                                                 className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
//                                                             >
//                                                                 ★
//                                                             </span>
//                                                         ))}
//                                                     </div>
//                                                     <span className="text-sm text-gray-600">
//                                                         ({product.numReviews})
//                                                     </span>
//                                                 </div>
//                                             )}

//                                             {/* Price */}
//                                             <div className="flex items-baseline gap-2 mb-3">
//                                                 <span className="text-2xl font-bold text-gray-900">
//                                                     {formatPrice(product.price)}
//                                                 </span>
//                                                 {product.compareAtPrice && product.compareAtPrice > product.price && (
//                                                     <span className="text-sm text-gray-500 line-through">
//                                                         {formatPrice(product.compareAtPrice)}
//                                                     </span>
//                                                 )}
//                                             </div>

//                                             {/* View Button */}
//                                             <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
//                                                 <ShoppingCart size={18} />
//                                                 View Details
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </Link>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div className="text-center py-20 bg-white rounded-lg">
//                         <Package size={64} className="mx-auto text-gray-300 mb-4" />
//                         <p className="text-gray-500 text-xl">No products in this collection yet.</p>
//                         <p className="text-gray-400 mt-2">Check back soon for new arrivals!</p>
//                     </div>
//                 )}
//             </div>

//             {/* Gallery Section (if available) */}
//             {collection.galleryImages && collection.galleryImages.length > 0 && (
//                 <div className="bg-white py-12">
//                     <div className="container mx-auto px-4">
//                         <h2 className="text-3xl font-bold text-gray-900 mb-8">Gallery</h2>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             {collection.galleryImages.map((image, index) => (
//                                 <div key={index} className="aspect-square overflow-hidden rounded-lg">
//                                     <img
//                                         src={image.url}
//                                         alt={image.alt || `Gallery ${index + 1}`}
//                                         className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}
//             <Footer/>
//         </div>
//     );
// };

// export default ProductShow;


import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, Tag, Package, ShoppingCart, Filter, 
    ChevronDown, Grid, List, Star 
} from 'lucide-react';

import Footer from './Footer';

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
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
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
    console.log(category)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/categories" className="text-amber-600 hover:text-amber-700">
                            Categories
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-semibold">{category.name}</span>
                    </div>
                </div>
            </div>

            {/* Category Header */}
            <div className="relative h-80 bg-gradient-to-r from-amber-500 to-orange-600">
                <img
                    src={category.categoryImage?.url || category.collectionImage?.url}
                    alt={category.categoryImage?.alt || category.name}
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{category.name}</h1>
                        <p className="text-xl max-w-2xl mx-auto px-4">
                            {category.description}
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
                                <Package className="inline mr-2" size={20} />
                                {pagination?.total || products.length} {(pagination?.total || products.length) === 1 ? 'Product' : 'Products'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Filter size={20} />
                                    Filters
                                </h3>
                                {(selectedSubcategory || minPrice || maxPrice || inStock) && (
                                    <button 
                                        onClick={clearFilters}
                                        className="text-sm text-amber-600 hover:underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Subcategories Filter */}
                            {subcategories && subcategories.length > 0 && (
                                <div className="mb-6">
                                    <label className="block font-semibold mb-2 text-sm">
                                        Subcategory
                                    </label>
                                    <select
                                        value={selectedSubcategory}
                                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="">All</option>
                                        {subcategories.map(sub => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.name} ({sub.stats?.productCount || 0})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-sm">
                                    Price Range
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Min (₦)"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max (₦)"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* In Stock Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={inStock}
                                        onChange={(e) => setInStock(e.target.checked)}
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <span className="text-sm">In Stock Only</span>
                                </label>
                            </div>

                            {/* Apply Filters Button */}
                            <button
                                onClick={handleFilterChange}
                                className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </aside>

                    {/* Products Section */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
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
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-white'}`}
                                    >
                                        <Grid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-white'}`}
                                    >
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {products.length > 0 ? (
                            <>
                                <div className={viewMode === 'grid' 
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'space-y-4'
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
                                                className="group"
                                            >
                                                <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                                                    viewMode === 'list' ? 'flex' : ''
                                                }`}>
                                                    {/* Product Image */}
                                                    <div className={`relative overflow-hidden bg-gray-100 ${
                                                        viewMode === 'list' ? 'w-48 h-48' : 'h-64'
                                                    }`}>
                                                        <img
                                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Product'}
                                                            alt={product.images?.[0]?.alt || product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        
                                                        {/* Badges */}
                                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                            {discount > 0 && (
                                                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                                    -{discount}%
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {stockQuantity === 0 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <span className="text-white font-bold text-lg">Out of Stock</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="p-4 flex-1">
                                                        {/* Category/Type Badge */}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                                                {product.subcategoryId?.name || 
                                                                 product.categoryId?.name || 
                                                                 product.drumType || 
                                                                 'Product'}
                                                            </span>
                                                            <div className={`w-2 h-2 rounded-full ${stockBadge.color}`}></div>
                                                            <span className="text-xs text-gray-600">{stockBadge.text}</span>
                                                        </div>

                                                        {/* Product Name */}
                                                        <h3 className="font-bold text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                            {product.name}
                                                        </h3>

                                                        {/* Vendor (NEW!) */}
                                                        {product.vendorId && (
                                                            <p className="text-sm text-gray-500 mb-2">
                                                                by {product.vendorId.storeName}
                                                            </p>
                                                        )}

                                                        {/* Rating */}
                                                        {(product.rating > 0 || product.avgRating > 0) && (
                                                            <div className="flex items-center gap-1 mb-3">
                                                                <div className="flex">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            size={16}
                                                                            className={i < Math.floor(product.rating || product.avgRating) 
                                                                                ? 'text-yellow-400 fill-yellow-400' 
                                                                                : 'text-gray-300'}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm text-gray-600">
                                                                    ({product.numReviews || product.reviewCount || 0})
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Price */}
                                                        <div className="flex items-baseline gap-2 mb-3">
                                                            <span className="text-2xl font-bold text-gray-900">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                                <span className="text-sm text-gray-500 line-through">
                                                                    {formatPrice(product.compareAtPrice)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* View Button */}
                                                        <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                                                            <ShoppingCart size={18} />
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.pages > 1 && (
                                    <div className="mt-8 flex justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`px-4 py-2 rounded-lg ${
                                                    currentPage === i + 1
                                                        ? 'bg-amber-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === pagination.pages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg">
                                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-xl">No products found</p>
                                <p className="text-gray-400 mt-2">
                                    {selectedSubcategory || minPrice || maxPrice || inStock
                                        ? 'Try adjusting your filters'
                                        : 'Check back soon for new arrivals!'}
                                </p>
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
            
            <Footer/>
        </div>
    );
};

export default CategoryProducts;