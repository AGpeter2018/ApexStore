import React from 'react';
import { Globe, Heart, Users, Sparkles, Plus } from 'lucide-react';

const GlobalMission = () => {
    const stats = [
        { label: "Active Artisans", value: "2,500", suffix: "+" },
        { label: "Community Impact", value: "₦500k", suffix: "+" },
        { label: "Global Reach", value: "45", suffix: " Countries" },
        { label: "Heritage Projects", value: "120", suffix: "+" }
    ];

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-black"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2 space-y-8 animate-fadeInUp">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Globe size={20} />
                            <span className="text-sm font-black uppercase tracking-[0.4em]">Our Global Pulse</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                            BEYOND <br />
                            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent italic">COMMERCE</span>
                        </h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                            We are building the backbone of a new African creative economy. Every transaction on ApexStore directly empowers the hands that create, ensuring the survival of centuries-old craftsmanship in a digital world.
                        </p>
                    </div>

                    <div className="lg:w-1/2 grid grid-cols-2 gap-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        {stats.map((s, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] group hover:bg-orange-600 transition-all duration-500 transform hover:-translate-y-2">
                                <div className="text-3xl md:text-5xl font-black text-white mb-2 flex items-baseline group-hover:scale-110 transition-transform">
                                    {s.value}
                                    <span className="text-xs text-orange-500 group-hover:text-white ml-1">{s.suffix}</span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white/80">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GlobalMission;
