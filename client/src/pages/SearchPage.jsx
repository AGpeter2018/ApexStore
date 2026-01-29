import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Grid, List, Star, Package, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiExpansion, setAiExpansion] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        if (query) {
            handleAISearch();
        }
    }, [query]);

    const handleAISearch = async () => {
        try {
            setLoading(true);

            // 1. Expand search intent using AI
            const expansionRes = await axios.post(`${import.meta.env.VITE_API_URL}/ai/expand-search-intent`, {
                query
            });

            const expansion = expansionRes.data.data;
            setAiExpansion(expansion);

            // 2. Fetch products using expanded terms
            // Combine original query and expanded terms for a broader search
            const searchQuery = [expansion.originalQuery, ...(expansion.expandedTerms || [])].join(' ');

            const params = new URLSearchParams({
                search: searchQuery,
                limit: 20
            });

            if (expansion.suggestedMaxPrice) {
                params.append('maxPrice', expansion.suggestedMaxPrice);
            }

            const productsRes = await axios.get(`${import.meta.env.VITE_API_URL}/products?${params}`);
            setProducts(productsRes.data.data);

        } catch (err) {
            console.error("AI Search failed:", err);
        } finally {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Search results for "{query}"
                    </h1>
                    {aiExpansion && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                            <Sparkles className="text-indigo-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-indigo-900 font-medium">
                                    AI understood your intent: <span className="text-indigo-700 italic">"{aiExpansion.intent}"</span>
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {aiExpansion.expandedTerms.slice(0, 5).map((term, i) => (
                                        <span key={i} className="text-xs bg-white text-indigo-600 px-2 py-1 rounded-full border border-indigo-200">
                                            {term}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
               </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product._id}
                                to={`/products/${product.slug}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300">
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <img
                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Product'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-3">
                                            {product.categoryId?.name}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm font-semibold">{product.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-2">Try searching for something else or explore our categories.</p>
                        <Link to="/categories" className="mt-6 inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Explore Categories
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SearchPage;
