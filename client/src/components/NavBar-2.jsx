import { ChevronDown, ChevronUp, Menu, Search, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnchorLink from 'react-anchor-link-smooth-scroll'
import ProductAdminFilterAndSearch from './ProductAdminFilterAndSearch'


const NavBar = ({scrolled}) => {
    const [openMenu, setOpenMenu] = useState(false)
    

   return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-slate-900 shadow-2xl' : 'bg-slate-950 backdrop-blur-sm'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-14 sm:h-16 md:h-20'>
                <Link to="/" className='flex items-center'>
                    <div className='w-12 sm:w-16 sm:h-16 h-12 '>
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:'1' }}/>
                                <stop offset="100%" style={{stopColor:'#06b6d4',stopOpacity: '1' }}/>
                                </linearGradient>
                                <filter id="shadow"> <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.25"/>
                                </filter>
                                </defs>
                                <g transform="translate(50, 50)" filter="url(#shadow)"><rect x="-20" y="-15" width="40" height="38" rx="4" 
                                fill="url(#gradient1)"/>
                                <path d="M -10 -15 Q -10 -28 0 -28 Q 10 -28 10 -15"  stroke="#1e293b" stroke-width="3" 
                                fill="none"
                                stroke-linecap="round"/>
                                <path d="M 0 -5 L -8 8 L 8 8 Z" fill="#fbbf24" 
                                opacity="0.9"/>
                                <circle cx="-8" cy="-5" r="2.5" fill="rgba(255,255,255,0.3)"/>
                                <line x1="-15" y1="18" x2="15" y2="18" 
                                stroke="rgba(255,255,255,0.2)" 
                                stroke-width="2"
                                stroke-linecap="round"/>
                                </g>
                            </svg>
               </div>
                  <div className='text-xl font-bold font-serif tracking-tight cursor-pointer pl-0'>
                 <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  ApexStore
                </span>
                </div>
                </Link>
                
                {/* <ProductAdminFilterAndSearch/> */}
               
                <div className='hidden md:flex items-center '>
                  <Search className=' text-gray-300 cursor-pointer w-5 h-6  md:block hidden'/>
                    <button className="pl-4 text-gray-300 hover:text-white sm:block ">
                        <User className="w-6 h-6 cursor-pointer" />
                    </button>
                  <button className="px-4 py-2 text-sm text-gray-300 hover:text-white sm:block cursor-pointer">
                     Login
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 sm:block cursor-pointer">Sign Up
                    </button>
                   <Search className='block text-gray-300 cursor-pointer w-5 h-6  md:hidden cursor-pointer'/>
                </div>
             
                 <button className='md:hidden block cursor-pointer p-2 text-gray-300 hover:text-white' onClick={()=> setOpenMenu((prev) => !prev)}>
                                   {openMenu ? 
                                   (<X className='w-5 h-6 sm:w-6 h-6'/>)
                                   :
                                   (<Menu className='w-5 h-6 sm:w-6 h-6'/>)
                               }
                               </button>
                
            </div>
        </div>

        {/* for open bar */}

        {openMenu && (
                    <div className='md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 animation-in slide-in-from-top duration-300 shadow-2xl'>
                                                   <button className="pl-4 text-gray-300 hover:text-gray-200/50 block  border border-slate-700 py-2 w-full rounded-xl mb-3 bg-slate-700/50 hover:bg-slate-950 cursor-pointer">
                              <User className="w-6 h-6 mx-auto" />
                            </button>
                           <hr className="border-slate-800" />
                    <button className="w-full px-4 py-2 text-sm text-gray-300 hover:text-gray-200/50 border border-slate-700 bg-slate-700/50 hover:bg-slate-950 rounded-lg cursor-pointer">
                      Login
                    </button>
                    <button className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg cursor-pointer hover:from-orange-600 hover:to-red-600">
                      Sign Up
                    </button>
                        </div>
                    )}

    </nav>
  )
}

export default NavBar