import { ChevronDown, ChevronUp, Menu, Search, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnchorLink from 'react-anchor-link-smooth-scroll'
import ProductAdminFilterAndSearch from './ProductAdminFilterAndSearch'


const NavBar = ({ scrolled }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className='flex items-center'>
                        <div className='w-12 sm:w-16 sm:h-16 h-12 '>
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: '1' }} />
                                        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: '1' }} />
                                    </linearGradient>
                                    <filter id="shadow"> <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.25" />
                                    </filter>
                                </defs>
                                <g transform="translate(50, 50)" filter="url(#shadow)"><rect x="-20" y="-15" width="40" height="38" rx="4"
                                    fill="url(#gradient1)" />
                                    <path d="M -10 -15 Q -10 -28 0 -28 Q 10 -28 10 -15" stroke="#1e293b" stroke-width="3"
                                        fill="none"
                                        stroke-linecap="round" />
                                    <path d="M 0 -5 L -8 8 L 8 8 Z" fill="#fbbf24"
                                        opacity="0.9" />
                                    <circle cx="-8" cy="-5" r="2.5" fill="rgba(255,255,255,0.3)" />
                                    <line x1="-15" y1="18" x2="15" y2="18"
                                        stroke="rgba(255,255,255,0.2)"
                                        stroke-width="2"
                                        stroke-linecap="round" />
                                </g>
                            </svg>
                        </div>
                        <div className='text-xl font-bold font-serif tracking-tight cursor-pointer pl-0'>
                            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                                ApexStore
                            </span>
                        </div>
                    </Link>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/categories" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                            Collections
                        </Link>
                        {user.role === 'vendor' && (
                            <Link to="/vendor/dashboard" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                Vendor Dashboard
                            </Link>
                        )}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium transition-colors">
                                Admin Panel
                            </Link>
                        )}
                        {user.email ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Hello, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col gap-4">
                            <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            <Link to="/collections" className="text-gray-700 hover:text-orange-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
                            {user.role === 'vendor' && (
                                <Link to="/vendor/dashboard" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Vendor Dashboard</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                            )}
                            {user.email ? (
                                <button onClick={handleLogout} className="text-left text-red-600 font-medium">Logout</button>
                            ) : (
                                <Link to="/login" className="text-orange-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar