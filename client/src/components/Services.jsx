import React from 'react';
import { Shield, Truck, Users, Zap, ArrowUpRight } from 'lucide-react';

const services = [
    {
        icon: <Shield className="text-orange-500" size={32} />,
        header: 'Verified Vendors',
        text: 'Every merchant on ApexStore undergoes a rigorous multi-step verification process to ensure authenticity and quality.'
    },
    {
        icon: <Truck className="text-orange-500" size={32} />,
        header: 'Global Logistics',
        text: 'Secure door-to-door delivery across Africa and internationally, with real-time tracking for every masterpiece.'
    },
    {
        icon: <Users className="text-orange-500" size={32} />,
        header: 'Direct Artisan Support',
        text: 'We bridge the gap between traditional craft and modern commerce, ensuring fair trade and direct impact to makers.'
    },
    {
        icon: <Zap className="text-orange-500" size={32} />,
        header: 'Expert Curation',
        text: 'Our team hand-picks the most impactful cultural products, ensuring you discover the best of African innovation.'
    }
];

const Services = () => {
    return (
        <section id='services' className="py-32 bg-slate-950 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[150px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 animate-fadeInUp">
                <div className="text-center mb-20">
                    <h2 className="text-sm font-black text-orange-500 uppercase tracking-[0.4em] mb-4">The Apex Advantage</h2>
                    <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                        BEYOND JUST A <br />
                        <span className="text-slate-500">MARKETPLACE</span>
                    </h3>
                    <p className="text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        We are building the digital infrastructure for African commerce—where authenticity meets accessibility.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, id) => (
                        <div key={id} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                {service.icon}
                            </div>
                            <h4 className="text-2xl font-black text-white mb-4 tracking-tight">{service.header}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                {service.text}
                            </p>
                            <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Learn More <ArrowUpRight size={14} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Footer */}
                <div className="mt-24 pt-12 border-t border-white/5 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
                        <Shield size={20} /> SECURE ESCROW
                    </div>
                    <div className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
                        <Users size={20} /> 5-STAR VENDORS
                    </div>
                    <div className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
                        <Zap size={20} /> INSTANT PAYOUTS
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services