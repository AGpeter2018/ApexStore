import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, ShoppingCart, Star, Eye, TrendingUp, Sparkles, Package } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Using the VITE_API_URL environment variable as configured in previous steps
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products?limit=8`);
                setProducts(response.data.data || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <section id="product" className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Design Element - subtle glow */}
            <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-orange-600/5 blur-[120px] rounded-full -ml-64" />

            <div className="container mx-auto px-6 relative z-10 animate-fadeInUp">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8">
                    <div className="max-w-2xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                            <TrendingUp className="text-orange-500" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Handpicked Excellence</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
                            APEX <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">SIGNATURE</span>
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-xl text-lg">
                            The finest artisanal treasures, directly from the makers.
                            Every piece tells a story of heritage and verified excellence.
                        </p>
                    </div>

                    <div className='pr-5'>
                        {/* Modern Filter Tabs */}
                        <div className="flex  bg-black/40  p-1.5  rounded-2xl border border-white/5 backdrop-blur-md">
                            {['all', 'latest', 'popular'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab
                                        ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/40'
                                        : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-slate-800 aspect-[4/5] rounded-[2.5rem] mb-6 shadow-2xl"></div>
                                <div className="h-4 bg-slate-800 rounded-full w-3/4 mb-3"></div>
                                <div className="h-4 bg-slate-800 rounded-full w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {products.map((product) => (
                            <div key={product._id} className="group">
                                {/* Product Card */}
                                <div className="relative bg-slate-900/40 rounded-[3rem] border border-white/5 p-4 transition-all duration-700 hover:border-orange-500/40 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(234,88,12,0.4)]">

                                    {/* Image Base */}
                                    <div className="aspect-[4/5] relative rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-inner">
                                        <img
                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Apex+Collection'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                        />

                                        {/* Floating Actions */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute inset-x-0 bottom-6 px-6 flex justify-center gap-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                                            <button className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all transform hover:scale-110 shadow-2xl">
                                                <ShoppingCart size={24} />
                                            </button>
                                            <Link to={`/product/${product.slug || product._id}`} className="w-14 h-14 rounded-2xl bg-orange-600/90 backdrop-blur-md text-white flex items-center justify-center hover:bg-orange-500 transition-all transform hover:scale-110 shadow-2xl">
                                                <Eye size={24} />
                                            </Link>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-black text-white uppercase tracking-[0.2em]">
                                                {product.category?.name || 'Curated'}
                                            </div>
                                            {product.stock < 10 && (
                                                <div className="px-3 py-1 bg-red-600/90 rounded-full text-[8px] font-black text-white uppercase tracking-[0.2em] animate-pulse">
                                                    Rare Find
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Base */}
                                    <div className="p-6 text-left">
                                        <div className="flex items-center gap-1 text-amber-500 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < 4 ? "currentColor" : "none"} />
                                            ))}
                                            <span className="text-[10px] font-bold text-slate-500 ml-1">4.8</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-black text-white tracking-tight">
                                                {formatPrice(product.price)}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-all">
                                                @{product.vendor?.storeName || 'Official'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-slate-950/40 rounded-[4rem] border border-dashed border-white/10">
                        <Package size={64} className="mx-auto text-slate-800 mb-6" />
                        <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Vibrant Choices Pending</h4>
                        <p className="text-slate-500 font-medium">New marketplace treasures are arriving momentarily.</p>
                    </div>
                )}

                {/* Epic Marketplace CTA Section */}
                <div className="mt-32 relative rounded-[4rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-rose-700 to-amber-600 transition-transform duration-700 group-hover:scale-105" />
                    <img
                        src="https://images.unsplash.com/photo-1523450001312-faa4e2e37f0f?w=1920&q=80"
                        className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay group-hover:scale-120 transition-transform duration-[20s]"
                        alt="Join marketplace"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />

                    <div className="relative z-10 px-8 py-20 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                        <div className="max-w-xl">
                            <h3 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
                                JOIN THE <br />
                                <span className="underline decoration-white/20 underline-offset-8">PREMIUM</span> ECONOMY
                            </h3>
                            <p className="text-orange-100 text-xl font-medium opacity-80 leading-relaxed">
                                Join 500+ verified vendors and thousands of collectors in Africa's most vibrant digital pulse.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                            <Link
                                to="/categories"
                                className="bg-white text-black px-12 py-4 md:py-5 lg:py-7 rounded-3xl font-black text-xs md:text-sm lg:text-xl hover:shadow-[0_30px_60px_rgba(255,255,255,0.3)] hover:-translate-y-2 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                START EXPLORING
                                <ArrowRight size={24} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Products;