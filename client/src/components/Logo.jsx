import React from 'react';

const Logo = ({ size = "md", showText = true, light = false }) => {
    const sizeClasses = {
        sm: { icon: "h-8 w-8", text: "text-lg", gap: "gap-2" },
        md: { icon: "h-10 w-10", text: "text-xl md:text-2xl", gap: "gap-2" },
        lg: { icon: "h-20 w-20", text: "text-4xl", gap: "gap-4" }
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`flex items-center ${currentSize.gap} group cursor-pointer`}>
            {/* Logo Icon */}
            <div className={`relative ${currentSize.icon} flex-shrink-0`}>
                <div className={`absolute inset-0 bg-indigo-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <svg
                    className='w-full h-full relative group-hover:scale-110 transition-transform duration-500'
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: '1' }} />
                            <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: '1' }} />
                        </linearGradient>
                    </defs>
                    <g transform="translate(50, 50)">
                        <rect x="-22" y="-22" width="44" height="44" rx="12" fill="url(#logoGradient)" />
                        <path d="M -10 -15 Q -10 -25 0 -25 Q 10 -25 10 -15" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <circle cx="0" cy="5" r="8" fill="white" opacity="0.2" />
                        <path d="M -6 5 L 6 5" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </g>
                </svg>
            </div>

            {/* Logo Text */}
            {showText && (
                <div className={`${currentSize.text} font-black tracking-tighter ${light ? 'text-white' : 'text-gray-900'}`}>
                    Apex<span className="text-indigo-600">Store</span>
                </div>
            )}
        </div>
    );
};

export default Logo;
