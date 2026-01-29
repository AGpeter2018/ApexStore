import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
    {
        id: 'fashion',
        title: 'Bespoke Fashion',
        name: 'Apparel & Fabrics',
        description: 'Authentic African textiles, handcrafted garments, and contemporary ancestral styles.',
        image: 'https://images.unsplash.com/photo-1523450001312-faa4e2e37f0f?w=800&q=80',
        color: 'from-orange-500 to-rose-600'
    },
    {
        id: 'art-decor',
        title: 'Interior Soul',
        name: 'Art & Decor',
        description: 'Traditional sculpture, modern paintings, and handcrafted home essentials.',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        color: 'from-amber-500 to-orange-600'
    },
    {
        id: 'instruments',
        title: 'Rhythm of Heritage',
        name: 'Traditional Music',
        description: 'The iconic voices of Africa—drums, kalimbas, and strings from master makers.',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
        color: 'from-rose-600 to-red-800'
    }
];

import { motion } from 'framer-motion';

const FeaturedCategories = () => {
    return (
        <section id="categories" className="py-24 bg-black overflow-hidden relative">
            {/* Design Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -mr-64 -mt-64" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-[1px] bg-orange-500"></span>
                            <h2 className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">Curated Heritage</h2>
                        </div>
                        <h3 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                            TREASURES OF <br />
                            <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500 bg-clip-text text-transparent italic">AFRICAN CRAFT</span>
                        </h3>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link to="/categories" className="group flex items-center gap-4 text-white font-bold hover:text-orange-400 transition-all">
                            <span className="tracking-widest">EXPLORE ALL</span>
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-600 transition-all">
                                <ArrowRight size={20} className="md:size-24 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.2 }}
                        >
                            <Link
                                to={`/categories?id=${cat.id}`}
                                className="group relative block h-[400px] sm:h-[500px] lg:h-[600px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 hover:border-orange-500/30 transition-all duration-700 shadow-2xl"
                            >
                                {/* Background Image with Zoom */}
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                                />

                                {/* Glassmorphism Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/80 to-transparent pt-32">
                                    <div className={`w-12 h-1.5 bg-gradient-to-r ${cat.color} mb-6 rounded-full transform group-hover:w-full transition-all duration-700 origin-left`} />
                                    <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-3 block">{cat.title}</span>
                                    <h4 className="text-4xl font-black text-white mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-500">{cat.name}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 delay-100">
                                        {cat.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest group-hover:text-orange-400 transition-colors">
                                        SHOP COLLECTION
                                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCategories;
