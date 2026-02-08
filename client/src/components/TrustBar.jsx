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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center text-center group animate-fadeInUp"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-all duration-700 transform group-hover:rotate-[360deg] shadow-[0_0_20px_rgba(234,88,12,0)] group-hover:shadow-[0_0_40px_rgba(234,88,12,0.4)]">
                                <div className="group-hover:scale-125 transition-transform duration-500 text-orange-500 group-hover:text-white">
                                    {f.icon}
                                </div>
                            </div>
                            <h4 className="text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2 group-hover:text-orange-500 transition-colors">{f.title}</h4>
                            <p className="text-slate-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{f.desc}</p>
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
