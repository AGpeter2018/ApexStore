import {Link} from 'react-router-dom'
import React, { useEffect, useState } from 'react'

const images = [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1920&q=80"
]

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 5000)
        
        return () => clearInterval(interval)
    }, [])
    
    return (
        <section id="home" className="relative pt-40 pb-24 px-8 text-center overflow-hidden min-h-screen flex items-center">
            {/* Background Images Container */}
            <div className="absolute inset-0 z-0">
                {images.map((image, id) => (
                    <img 
                        key={id}
                        src={image} 
                        alt={`African Drums Background ${id + 1}`} 
                        className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                            id === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-slate-800/80"></div>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-fadeInUp">
                    Authentic Yoruba Drums
                </h1>
                <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed animate-fadeInUp-delay-1">
                    Experience the Rich Cultural Heritage of Nigerian Percussion - Handcrafted by Master Artisans
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp-delay-2">
                    <Link to="/categories"  className="bg-slate-50 text-slate-950 px-10 py-4 rounded-lg text-lg font-bold hover:bg-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl inline-block">
                        Shop Now
                    </Link>
                    <Link to="/more" href="#about" className="bg-slate-800/50 backdrop-blur-sm text-white border-2 border-slate-400 px-10 py-4 rounded-lg text-lg font-bold hover:bg-slate-700 hover:border-slate-300 transition-all inline-block">
                        Learn More
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Hero