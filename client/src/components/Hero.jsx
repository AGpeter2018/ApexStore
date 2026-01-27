import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { ShoppingBag, Sparkles, Store, Users, Zap, ArrowRight, Play } from 'lucide-react'

const images = [
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1920&q=80", // African lifestyle/fashion
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80", // Music/Instruments
    "https://images.unsplash.com/photo-1523450001312-faa4e2e37f0f?w=1920&q=80", // African Art/Decor
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&q=80"  // Celebration/Life
]

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 6000)

        return () => clearInterval(interval)
    }, [])

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Images with Ken Burns Effect */}
            <div className="absolute inset-0 z-0">
                {images.map((image, id) => (
                    <div
                        key={id}
                        className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${id === currentImageIndex ? 'opacity-40 scale-110' : 'opacity-0 scale-100'
                            }`}
                        style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'opacity 2s ease-in-out, transform 6s linear'
                        }}
                    />
                ))}
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/20 to-slate-950/80"></div>
            </div>

            {/* Content Container */}
            <div className={`relative z-10 container mx-auto px-6 text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-bounce">
                    <Sparkles className="text-orange-500" size={16} />
                    <span className="text-xs font-bold tracking-widest text-orange-200 uppercase tracking-[0.3em]">The Premier African Marketplace</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tighter leading-none animate-fadeInUp">
                    <span className="block mb-2">DISCOVER THE</span>
                    <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                        PULSE OF AFRICA
                    </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium animate-fadeInUp animate-fadeInUp-delay-1">
                    From handcrafted masterpieces to modern essentials.
                    Connect directly with the finest artisans and vendors across the continent.
                </p>

                {/* Direct CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp animate-fadeInUp-delay-2">
                    <Link
                        to="/categories"
                        className="group relative px-12 py-5 bg-orange-600 text-white rounded-2xl font-black text-xl hover:bg-orange-700 transition-all shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="flex items-center gap-2">
                            START SHOPPING
                            <ShoppingBag size={24} />
                        </span>
                    </Link>

                    <Link
                        to="/register?role=vendor"
                        className="flex items-center gap-4 px-8 py-5 text-white bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl font-bold hover:bg-white/10 transition-all group"
                    >
                        <Store className="text-orange-500" size={24} />
                        BECOME A VENDOR
                    </Link>
                </div>

                {/* Stats / Trust Badges */}
                <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Verified Vendors', value: '500+', icon: <Users size={16} /> },
                        { label: 'Categories', value: '25+', icon: <Zap size={16} /> },
                        { label: 'Secure Payments', value: '100%', icon: <Sparkles size={16} /> },
                        { label: 'Global Delivery', value: '48h', icon: <ArrowRight size={16} /> }
                    ].map((stat, i) => (
                        <div key={i} className="text-center group cursor-default">
                            <div className="flex justify-center mb-2 text-slate-500 group-hover:text-orange-500 transition-colors">
                                {stat.icon}
                            </div>
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 group-hover:text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse">
                <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-orange-500 to-transparent" />
            </div>
        </section>
    )
}

export default Hero
