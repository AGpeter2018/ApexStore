import React, { useState } from 'react';
import { Mail, Sparkles, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail('');
    };

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Texture/Effects */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-orange-600/5 blur-[180px] rounded-full"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto bg-slate-900 border border-white/5 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 shadow-2xl overflow-hidden relative group">
                    {/* Animated Border Glow */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
                        <div className="lg:w-1/2 space-y-6 md:space-y-8 animate-fadeInUp">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
                                <Sparkles size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">THE INNER CIRCLE</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                JOIN THE <br />
                                <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent italic">PREMIUM ECONOMY</span>
                            </h2>
                            <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed">
                                Experience African excellence before the world. Be the first to receive notifications of bespoke drops, artisan stories, and exclusive heritage collections.
                            </p>
                            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-orange-500" /> Secure Privacy</div>
                                <div className="flex items-center gap-2"><Globe size={14} className="text-orange-500" /> Global Dispatch</div>
                                <div className="flex items-center gap-2"><Sparkles size={14} className="text-orange-500" /> Early Access</div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                            {subscribed ? (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-950/20">
                                        <Mail className="text-white" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">WELCOME TO THE CIRCLE</h3>
                                    <p className="text-slate-400 font-medium">Please verify your invitation in your inbox.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="your@excellence.com"
                                            className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-8 px-10 text-white text-xl font-bold placeholder-slate-700 focus:border-orange-500/50 focus:bg-black transition-all outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-600 text-white p-5 rounded-2xl hover:bg-orange-700 transition-all shadow-xl active:scale-90"
                                        >
                                            <ArrowRight size={28} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                                        NO SPAM. ONLY HERITAGE. UNSUBSCRIBE ANYTIME.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
