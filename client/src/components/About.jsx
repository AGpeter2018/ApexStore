import React from 'react';
import { Target, Globe, Heart } from 'lucide-react';
import Testimonies from './Testimonies.jsx';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="bg-black">
            <Testimonies />

            <section id="about" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Visual Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-orange-600/20 blur-[100px] rounded-full group-hover:bg-orange-600/30 transition-all duration-700" />
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1523450001312-faa4e2e37f0f?w=1024&q=80"
                                alt="African Artistry"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s] scale-105 hover:scale-100"
                            />
                            {/* Floating Card */}
                            <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                                        <Heart size={24} className="text-white" fill="white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">100% Authentic</h4>
                                        <p className="text-slate-400 text-xs uppercase tracking-widest">Handcrafted Excellence</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-left"
                    >
                        <div className="inline-flex items-center gap-2 mb-6">
                            <Globe className="text-orange-500" size={20} />
                            <span className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">Our Mission</span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
                            THE SOUL OF <br />
                            <span className="text-slate-500">DIGITAL COMMERCE</span>
                        </h2>

                        <div className="space-y-6">
                            <p className="text-xl text-slate-300 font-medium leading-relaxed">
                                ApexStore is more than a marketplace. We are a digital sanctuary for African craftsmanship,
                                designed to bridge the gap between traditional masters and the global stage.
                            </p>

                            <p className="text-slate-400 leading-relaxed italic border-l-2 border-orange-500/50 pl-6 py-2">
                                "Our mission is to empower 10,000+ African vendors by 2030,
                                ensuring that every artisan receives the true value for their sacred work."
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 py-8 border-t border-white/5">
                                <div className="flex flex-col gap-3">
                                    <Target className="text-orange-500" size={28} />
                                    <h5 className="text-white font-bold text-lg">Direct Impact</h5>
                                    <p className="text-slate-500 text-sm">We ensure 90% of every sale goes directly to the original makers and local vendors.</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Heart className="text-orange-500" size={28} />
                                    <h5 className="text-white font-bold text-lg">Sacred Heritage</h5>
                                    <p className="text-slate-500 text-sm">Every item is verified for cultural authenticity and premium material standards.</p>
                                </div>
                            </div>

                            <div className="pt-8">
                                <a href="#contact" className="group flex items-center gap-4 text-white font-black text-xs uppercase tracking-[0.3em] hover:text-orange-500 transition-colors">
                                    Partner With Us
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-600 transition-all">
                                        <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;