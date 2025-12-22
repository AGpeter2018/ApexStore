import { ChevronDown, ChevronUp, Menu, Search, User, X, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AnchorLink from 'react-anchor-link-smooth-scroll'


const Navbar = ({ scrolled }) => {
  const [openMenu, setOpenMenu] = useState(false)
  const [openArrow, setOpenArrow] = useState(false)
  const [markTab, setMarkTab] = useState('home')
  const [openCategories, setOpenCategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setOpenMenu(false);
    }
  };
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-slate-900 shadow-2xl' : 'bg-slate-950 backdrop-blur-sm'}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-14 sm:h-16 md:h-20'>
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
          <div className='space-x-6 hidden md:flex items-center lg:space-8'>
            <AnchorLink href="#home" offset={50} >
              <a className={`text-gray-300 hover:text-white text-sm lg:text-base ${markTab === 'home' ? ('border-b-3 border-blue-900 py-5 ') : ('')}`} onClick={() => setMarkTab('home')}>Home</a>
            </AnchorLink>

            <AnchorLink href="#services" offset={50} >
              <a className={`text-gray-300 hover:text-white text-sm lg:text-base ${markTab === 'services' ? ('border-b-3 border-blue-900 py-5 ') : ('')}`} onClick={() => setMarkTab('services')}>Services</a>
            </AnchorLink>
            <div className='flex items-center'>
              <AnchorLink href="#product" offset={50} >
                <a className={`text-gray-300 hover:text-white text-sm lg:text-base ${markTab === 'shop' ? ('border-b-3 border-blue-900 py-5 ') : ('')}`} onClick={() => setMarkTab('shop')}>Products
                </a>
              </AnchorLink>
              <button className='text-gray-300 pt-1 cursor-pointer animation-in duration-300 slide-in-from-bottom' onClick={(e) => {
                e.preventDefault(),
                  e.stopPropagation()
                setOpenArrow((prev) => !prev)
              }}>
                {
                  openArrow ?
                    (<ChevronUp className='w-4 h-4' />)
                    :
                    (<ChevronDown className='w-4 h-4' />)
                }
              </button>
            </div>
            <AnchorLink href="#about" offset={50}>
              <a className={`text-gray-300 hover:text-white text-sm lg:text-base ${markTab === 'about' ? ('border-b-3 border-blue-900 py-5 ') : ('')}`} onClick={() => setMarkTab('about')}>About</a>
            </AnchorLink>
            <AnchorLink href="#contact" offset={50}>
              <a className={`text-gray-300 hover:text-white text-sm lg:text-base ${markTab === 'contact' ? ('border-b-3 border-blue-900 py-5 ') : ('')}`} onClick={() => setMarkTab('contact')}>Contact</a>
            </AnchorLink>
            <AnchorLink href="#blog" offset={50}>
              <a className={`text-gray-300 hover:text-white text-sm lg:text-base ${markTab === 'blog' ? ('border-b-3 border-blue-900 py-5 ') : ('')}`} onClick={() => setMarkTab('blog')}>Blog</a>
            </AnchorLink>
          </div>

          <div className='hidden md:flex items-center flex-1 max-w-xs mx-6'>
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder="AI Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:bg-white/10 focus:border-orange-500 transition-all outline-none backdrop-blur-md"
              />
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-4 h-4' />
            </form>
          </div>
          <button className="pl-4 text-gray-300 hover:text-white sm:block ">
            <User className="w-6 h-6 cursor-pointer" />
          </button>
          <button className="px-4 py-2 text-sm text-gray-300 hover:text-white sm:block cursor-pointer">
            Login
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 sm:block cursor-pointer">Sign Up
          </button>
          <Search className='block text-gray-300 cursor-pointer w-5 h-6  md:hidden cursor-pointer' />
        </div>
        <button className='md:hidden block cursor-pointer p-2 text-gray-300 hover:text-white' onClick={() => setOpenMenu((prev) => !prev)}>
          {openMenu ?
            (<X className='w-5 h-6 sm:w-6 h-6' />)
            :
            (<Menu className='w-5 h-6 sm:w-6 h-6' />)
          }
        </button>


      </div>

      {
        openArrow && (
          <div className='hidden md:block w-full  bg-slate-900 animation-in duration-700 slide-in-from-top'>
            <div className='inline-block  p-6 text-white text-base '>
              <div className=' mt-2 ml-4 space-y-2 pl-4 border-l-2  border-slate-700'>
                <div className='relative mb-3 '>
                  <div className='block p-3 w-50 bg-slate-700/50 rounded-xl text-gray-300 hover:text-gray-200/50 border border-slate-700 hover:bg-slate-950 rounded-lg cursor-pointer mb-3 flex items-center' onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenCategories((prev) => !prev);
                  }}>
                    <span>Categories</span>
                    <button
                      className='text-gray-300 pt-1 cursor-pointer'
                    >
                      {openCategories ? <ChevronUp className="w-4 h-4 cursor-pointer" /> : <ChevronDown className="w-4 h-4 cursor-pointer" />}
                    </button>
                  </div>
                </div>
                {/* Dropdown menu */}
                {openCategories && (
                  <ul className='mt-2 space-y-2 ml-4 pl-3 border-l-2 border-slate-700 animation-in duration-700 slide-in-from-top'>
                    <li>
                      <a href="#talking-drum" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer' onClick={() => setOpenCategories(false)}>
                        Talking Drum
                      </a>
                    </li>
                    <li>
                      <a href="#bata-drums" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer' onClick={() => setOpenCategories(false)}>
                        Bàtá Drums
                      </a>
                    </li>
                    <li>
                      <a href="#dundun" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer' onClick={() => setOpenCategories(false)}>
                        Dundun
                      </a>
                    </li>
                    <li>
                      <a href="#accessories" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer' onClick={() => setOpenCategories(false)}>
                        Accessories
                      </a>
                    </li>
                    <li>
                      <a href="#all-products" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer' onClick={() => setOpenCategories(false)}>
                        All Products
                      </a>
                    </li>
                  </ul>
                )}
                <a href="#new-arrivals" className='block p-3 w-50 bg-slate-700/50 rounded-xl text-gray-300 hover:text-gray-200/50 border border-slate-700 hover:bg-slate-950 rounded-lg cursor-pointer mb-3' onClick={() => setOpenCategories(false)}>New Arrivals</a>
                <a href="#deals" className='block p-3 w-50 bg-slate-700/50 rounded-xl text-gray-300 hover:text-gray-200/50 border border-slate-700 hover:bg-slate-950 rounded-lg cursor-pointer mb-3' onClick={() => setOpenCategories(false)}>Deals</a>
              </div>

            </div>
          </div>
        )
      }

      {
        openMenu && (
          <div className='md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 animation-in slide-in-from-top duration-300 shadow-2xl'>
            <div className='px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 transition-all duration-5'>
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search music, drums, culture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-orange-500"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </form>
              <AnchorLink href="#home" offset={50}>
                <a className='block text-gray-300 text-center border border-slate-700 py-2 hover:text-gray-200/50 bg-slate-700/50 hover:bg-slate-950  rounded-xl text-sm lg:text-base mb-3 cursor-pointer' onClick={() => setOpenMenu(false)}>Home</a>
              </AnchorLink>

              <AnchorLink href="#services" offset={50}>
                <a className='block text-gray-300 text-center border border-slate-700 py-2 hover:text-gray-200/50 bg-slate-700/50 hover:bg-slate-950  rounded-xl text-sm lg:text-base mb-3 cursor-pointer' onClick={() => setOpenMenu(false)}>Services</a>
              </AnchorLink>
              <div className='relative'>
                <AnchorLink href="#product" offset={50}>
                  <a className='flex items-center justify-center gap-2 text-gray-300 border border-slate-700 py-2 hover:text-gray-200/50 bg-slate-700/50 hover:bg-slate-950 rounded-xl text-sm lg:text-base cursor-pointer' onClick={() => setOpenMenu(false)}>
                    Product
                    <button
                      className='text-gray-300'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenArrow((prev) => !prev);
                      }}
                    >
                      {openArrow ? <ChevronUp className="w-4 h-4 cursor-pointer" /> : <ChevronDown className="w-4 h-4 cursor-pointer" />}
                    </button>
                  </a>
                </AnchorLink>

                {/* Dropdown menu (if you want submenu items) */}
                {openArrow && (
                  <div className='mt-2 ml-4 space-y-2 pl-4 border-l-2 border-slate-700 animation-in duration-700 slide-in-from-top'>
                    <div className='relative mb-3 '>
                      <div className='block p-3 w-50 bg-slate-700/50 rounded-xl text-gray-300 hover:text-gray-200/50 border border-slate-700 hover:bg-slate-950 rounded-lg cursor-pointer mb-3 flex items-center' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenCategories((prev) => !prev);
                      }}>
                        <span>Categories</span>
                        <button
                          className='text-gray-300 pt-1 cursor-pointer'
                        >
                          {openCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {
                      openCategories && (
                        <div className='mt-2 ml-4 space-y-2 pl-4 border-l-2 border-slate-700 animation-in duration-700 slide-in-from-top'>
                          <a href="#categories" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer'>Talking Drum</a>
                          <a href="#new-arrivals" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer'>Bàtá Drums</a>
                          <a href="#deals" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer'>Dundun</a>
                          <a href="#deals" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer'>Accessories</a>
                          <a href="#deals" className='block text-gray-300 text-sm hover:text-gray-200/50 py-1 cursor-pointer'>All Products</a>
                        </div>
                      )
                    }
                    <a href="#new-arrivals" className='block p-3 w-50 bg-slate-700/50 rounded-xl text-gray-300 hover:text-gray-200/50 border border-slate-700 hover:bg-slate-950 rounded-lg cursor-pointer mb-3' onClick={() => setOpenCategories(false)}>New Arrivals</a>
                    <a href="#deals" className='block p-3 w-50 bg-slate-700/50 rounded-xl text-gray-300 hover:text-gray-200/50 border border-slate-700 hover:bg-slate-950 rounded-lg cursor-pointer mb-3' onClick={() => setOpenCategories(false)}>Deals</a>
                  </div>
                )}
              </div>


              <AnchorLink href="#about" offset={50}>
                <a className='block text-gray-300 text-center border border-slate-700 py-2 hover:text-gray-200/50 bg-slate-700/50 hover:bg-slate-950  rounded-xl text-sm lg:text-base mb-3 cursor-pointer' onClick={() => setOpenMenu(false)}>About</a>
              </AnchorLink>
              <AnchorLink href="#contact" offset={50}>
                <a className='block text-center border border-slate-700 py-2 text-gray-300 hover:text-gray-200/50 bg-slate-700/50 hover:bg-slate-950  rounded-xl text-sm lg:text-base mb-3 cursor-pointer' onClick={() => setOpenMenu(false)}>Contact</a>
              </AnchorLink>
              <AnchorLink href="#blog" offset={50}>
                <a className='block text-center border border-slate-700 py-2 text-gray-300 hover:text-gray-200/50 bg-slate-700/50 hover:bg-slate-950  rounded-xl text-sm lg:text-base mb-3 cursor-pointer' onClick={() => setOpenMenu(false)}>Blog</a>
              </AnchorLink>
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
          </div>
        )
      }
    </nav>
  )
}

export default Navbar
