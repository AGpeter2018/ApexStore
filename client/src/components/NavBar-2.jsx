import { ChevronDown, ChevronUp, Menu, Search, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnchorLink from 'react-anchor-link-smooth-scroll'
import ProductAdminFilterAndSearch from './ProductAdminFilterAndSearch'


const NavBar = ({scrolled}) => {
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
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">🥁</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    Yoruba<span className="text-orange-600">Drums</span>
                                </span>
                            </Link>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center gap-8">
                                <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                                    Home
                                </Link>
                                <Link to="/collections" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                                    Collections
                                </Link>
                                {user.role === 'seller' && (
                                    <Link to="/seller" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        Seller Dashboard
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
                                    {user.role === 'seller' && (
                                        <Link to="/seller" className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Seller Dashboard</Link>
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