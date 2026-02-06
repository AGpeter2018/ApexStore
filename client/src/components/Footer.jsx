import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles, Facebook, Instagram, Twitter, Youtube, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
    return (
        <footer className="bg-slate-950 pt-24 pb-12 relative overflow-hidden">
            {/* Design Elements */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link to="/" className="block group w-fit">
                            <Logo size="md" light={true} />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                            Elevating African excellence. We connect discerning global citizens with the most authentic handcrafted treasures from across the continent.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all"><Instagram size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all"><Twitter size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all"><Facebook size={18} /></a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Digital Gallery</Link></li>
                            <li><Link to="/categories" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Collections</Link></li>
                            <li><Link to="/vendor" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Vendor Hub</Link></li>
                            <li><Link to="/disputes" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Support Center</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Curated Links</h4>
                        <ul className="space-y-4">
                            <li><Link to="/register?role=vendor" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Become a Creator</Link></li>
                            <li><a href="#" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Our Charter</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Shipping Ethics</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-indigo-500 text-sm font-bold transition-colors">Legal Sanctuary</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-8">
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em]">The Inner Circle</h4>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed">
                            Subscribe to receive early access to bespoke drops and artisan stories.
                        </p>
                        <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-xs text-white placeholder-slate-600 focus:bg-white/10 focus:border-indigo-500 transition-all outline-none"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-all active:scale-90 shadow-lg shadow-indigo-950/20">
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center md:text-left">
                        &copy; 2026 APEXSTORE WORLDWIDE. ALL RIGHTS RESERVED. <br />
                        <span className="text-slate-600">PRESERVING HERITAGE THROUGH MODERN COMMERCE.</span>
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-slate-500 opacity-50 hover:opacity-100 transition-opacity">
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Logistics Verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 opacity-50 hover:opacity-100 transition-opacity">
                            <ShieldCheck size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Payments Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;