import React from 'react';
import { Quote, Star, Sparkles } from 'lucide-react';

const Testimonies = () => {
    const reviews = [
        {
            name: "Adewale Johnson",
            location: "Lagos, NI",
            text: "The talking drum I purchased is exceptional! The craftsmanship is outstanding and the sound is authentic. A true piece of heritage.",
            rating: 5,
            delay: "0ms"
        },
        {
            name: "Folake Adeyemi",
            location: "Ibadan, NI",
            text: "As a cultural dance troupe, we needed quality instruments. ApexStore delivered beyond expectations. The heart of our performances.",
            rating: 5,
            delay: "200ms"
        },
        {
            name: "Chioma Okafor",
            location: "Abuja, NI",
            text: "Fast delivery and world-class service. Most importantly, the authenticity of the crafts is undeniable. I'll definitely order again!",
            rating: 5,
            delay: "400ms"
        }
    ];

    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/5 blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -ml-64 -mb-64" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fadeInUp">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="text-orange-500" size={18} />
                        <h2 className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">Community Pulse</h2>
                    </div>
                    <h3 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
                        VOICES OF <br />
                        <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500 bg-clip-text text-transparent italic">EXCELLENCE</span>
                    </h3>
                    <p className="text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Join thousands of global collectors and cultural guardians who have discovered the soul of Africa through our curated marketplace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((rev, i) => (
                        <div
                            key={i}
                            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] hover:bg-white/[0.08] hover:border-orange-500/30 transition-all duration-500 animate-fadeInUp shadow-2xl"
                            style={{ animationDelay: rev.delay }}
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-8 right-10 text-orange-500 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Quote size={48} />
                            </div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(rev.rating)].map((_, i) => (
                                    <Star key={i} size={14} className="text-orange-500 fill-orange-500" />
                                ))}
                            </div>

                            <p className="text-lg text-slate-200 font-medium leading-[1.8] italic mb-10 relative z-10">
                                "{rev.text}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-lg">
                                    {rev.name[0]}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold tracking-tight">{rev.name}</h4>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rev.location}</p>
                                </div>
                            </div>

                            {/* Hover Design Detail */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent group-hover:w-full transition-all duration-700" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonies;