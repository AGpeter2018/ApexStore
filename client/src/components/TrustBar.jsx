import React from 'react';
import { ShieldCheck, Truck, Recycle, Award, Sparkles } from 'lucide-react';

const TrustBar = () => {
    const features = [
        {
            icon: <ShieldCheck className="text-orange-500" size={24} />,
            title: "SECURE ESCROW",
            desc: "Protection for Every Sale"
        },
        {
            icon: <Truck className="text-orange-500" size={24} />,
            title: "EXPRESS LOGISTICS",
            desc: "Global Priority Shipping"
        },
        {
            icon: <Recycle className="text-orange-500" size={24} />,
            title: "ETHICAL SOURCING",
            desc: "Direct Artisan Impact"
        },
        {
            icon: <Award className="text-orange-500" size={24} />,
            title: "VERIFIED AUTHENTIC",
            desc: "Heritage Certified"
        }
    ];

    return (
        <div className="bg-black py-16 relative overflow-hidden">
            {/* Glossy Top Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center text-center group animate-fadeInUp"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-orange-600/10 group-hover:border-orange-500/50 transition-all duration-500 transform group-hover:-translate-y-2">
                                {f.icon}
                            </div>
                            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2">{f.title}</h4>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Glossy Bottom Line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
        </div>
    );
};

export default TrustBar;
