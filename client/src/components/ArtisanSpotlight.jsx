import React from 'react';
import { Sparkles, ArrowRight, Star, Heart, MapPin, BadgeCheck } from 'lucide-react';

const ArtisanSpotlight = () => {
    return (
        <section id="artisan-spotlight" className="py-32 bg-slate-950 relative overflow-hidden">
            {/* Design Elements */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full -mr-64 opacity-50" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">

                    {/* Visual Showcase */}
                    <div className="lg:w-1/2 relative group animate-fadeInUp">
                        <div className="absolute inset-0 bg-white/5 rounded-[4rem] -rotate-3 group-hover:rotate-0 transition-transform duration-700" />
                        <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1544924405-4c0717e47614?w=1200&q=80"
                                alt="Master Artisan at Work"
                                className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover hover:scale-105 transition-transform duration-[2s]"
                            />
                            {/* Floating Stats Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 p-6 md:p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl space-y-4 max-w-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-500 p-0.5">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" className="w-full h-full object-cover rounded-full" alt="Artisan Profile" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm md:text-base">Kojo Mensah</h4>
                                        <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">Master Sculptor</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-white">
                                    <div className="text-center px-2 md:px-4 border-r border-white/10">
                                        <p className="text-lg md:text-xl font-black">15</p>
                                        <p className="text-[7px] md:text-[8px] text-slate-500 uppercase font-black">Years</p>
                                    </div>
                                    <div className="text-center px-2 md:px-4 border-r border-white/10">
                                        <p className="text-lg md:text-xl font-black">4.9</p>
                                        <p className="text-[7px] md:text-[8px] text-slate-500 uppercase font-black">Rating</p>
                                    </div>
                                    <div className="text-center px-2 md:px-4">
                                        <p className="text-lg md:text-xl font-black">2k+</p>
                                        <p className="text-[7px] md:text-[8px] text-slate-500 uppercase font-black">Sales</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Story Content */}
                    <div className="lg:w-1/2 space-y-8 md:space-y-10 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        <div className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 w-fit">
                            <Sparkles size={16} />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">CRAFTSMAN OF THE MONTH</span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                            VOICE OF <br />
                            <span className="italic bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500 bg-clip-text text-transparent">THE ANCESTORS</span>
                        </h2>

                        <p className="text-xl text-slate-300 font-medium leading-relaxed italic border-l-4 border-orange-500 pl-8">
                            "Every piece of wood has a story waiting to be told. I don't just carve timber; I listen to the heartbeat of the forest and give it a physical form."
                        </p>

                        <div className="space-y-6 text-slate-400 font-medium leading-relaxed">
                            <p>
                                Kojo Mensah, a third-generation sculptor from the Ashanti region, is renowned for his ability to translate ancient proverbs into breathtaking hand-carved masterpieces.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500">
                                        <BadgeCheck size={24} />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold">Verified Mastery</h5>
                                        <p className="text-xs">Authenticity certified by the Heritage Council.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold">Kumasi Hub</h5>
                                        <p className="text-xs">Ships directly from the heart of Ghana.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button className="group flex items-center gap-6 text-white bg-transparent border-2 border-white/10 py-5 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:border-white transition-all">
                                VIEW ARTISAN'S COLLECTION
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ArtisanSpotlight;
