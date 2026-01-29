import { ChevronDown, ChevronUp, Menu, Search, User, X, Sparkles, ShoppingBag, LogOut, ShieldCheck, LayoutDashboard, Heart, MessageSquare } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import CartIcon from './CartIcon'


const Navbar = ({ scrolled }) => {
  const [openMenu, setOpenMenu] = useState(false)
  const [markTab, setMarkTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isHome = location.pathname === '/';

  // Force visible background logic on all sub-pages
  const shouldShowBg = scrolled || !isHome;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setOpenMenu(false);
    }
  };

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback if element doesn't exist on current page
      navigate(`/${href}`);
    }
  };

  const NavItem = ({ href, label, tab, mobile = false }) => {
    const baseClass = mobile
      ? 'p-4 bg-white/5 rounded-2xl text-center text-xs font-black text-slate-400 uppercase tracking-widest'
      : `hover:text-white transition-colors ${markTab === tab ? 'text-orange-500' : ''}`;

    const extraMobileClass = mobile && href === '#contact' ? ' col-span-2' : '';

    if (isHome) {
      return (
        <a
          href={href}
          onClick={(e) => {
            handleSmoothScroll(e, href);
            setMarkTab(tab);
            if (mobile) setOpenMenu(false);
          }}
          className={`${baseClass}${extraMobileClass}`}
        >
          {label}
        </a>
      );
    }
    return (
      <Link
        to={`/${href}`}
        className={`${baseClass}${extraMobileClass}`}
        onClick={() => {
          if (mobile) setOpenMenu(false);
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className={`${isHome ? 'fixed' : 'sticky'} top-0 w-full z-50 transition-all duration-500 ${shouldShowBg ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl py-4' : 'bg-transparent py-6'}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center'>
          {/* Logo Section */}
          <Link to="/" className='flex items-center gap-2 group'>
            <div className='w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform'>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: '1' }} />
                  </linearGradient>
                  <filter id="shadow"> <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
                  </filter>
                </defs>
                <g transform="translate(50, 50)" filter="url(#shadow)"><rect x="-20" y="-15" width="40" height="38" rx="4"
                  fill="url(#gradient1)" />
                  <path d="M -10 -15 Q -10 -28 0 -28 Q 10 -28 10 -15" stroke="#1e293b" strokeWidth="3"
                    fill="none"
                    strokeLinecap="round" />
                  <path d="M 0 -5 L -8 8 L 8 8 Z" fill="#fbbf24"
                    opacity="0.9" />
                  <circle cx="-8" cy="-5" r="2.5" fill="rgba(255,255,255,0.3)" />
                  <line x1="-15" y1="18" x2="15" y2="18"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <div className='text-xl md:text-2xl font-black tracking-tighter text-white'>
              APEX<span className="text-orange-500">STORE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-8'>
            <div className='flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>
              <NavItem href="#home" label="Home" tab="home" />
              <NavItem href="#categories" label="Heritage" tab="shop" />
              <NavItem href="#services" label="Benefits" tab="services" />
              <NavItem href="#about" label="Our Soul" tab="about" />
              <NavItem href="#contact" label="Contact" tab="contact" />
            </div>

            {/* AI Search Bar */}
            <div className='relative group ml-4'>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Universal Discovery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[10px] uppercase font-bold tracking-widest text-white placeholder-slate-500 focus:bg-white/10 focus:border-orange-500/50 transition-all outline-none backdrop-blur-md w-40 focus:w-64"
                />
                <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors' size={14} />
              </form>
            </div>

            {/* Auth/User Section */}
            <div className='flex items-center gap-4 border-l border-white/10 pl-8'>
              {user.token ? (
                <>
                  {user.role === 'customer' && <CartIcon />}

                  <div className='relative group'>
                    <button className='w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all'>
                      <User size={20} />
                    </button>

                    {/* Dropdown UI */}
                    <div className='absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
                      <div className='w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-xl'>
                        <div className='mb-4 pb-4 border-b border-white/5'>
                          <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>Logged in as</p>
                          <p className='text-white font-bold truncate'>{user.name}</p>
                        </div>

                        <div className='space-y-2'>
                          {user.role === 'admin' && (
                            <>
                              <Link to="/admin" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <ShieldCheck size={18} /> <span className='text-sm font-bold'>Admin Console</span>
                              </Link>
                              <Link to="/admin/categories" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <LayoutDashboard size={18} /> <span className='text-sm font-bold'>Categories</span>
                              </Link>
                              <Link to="/admin/vendors" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <User size={18} /> <span className='text-sm font-bold'>Vendors</span>
                              </Link>
                            </>
                          )}

                          {user.role === 'vendor' && (
                            <>
                              <Link to="/vendor" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <LayoutDashboard size={18} /> <span className='text-sm font-bold'>Vendor Hub</span>
                              </Link>
                              <Link to="/Categories" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <LayoutDashboard size={18} /> <span className='text-sm font-bold'>Categories</span>
                              </Link>
                            </>
                          )}

                          {user.role === 'customer' && (
                            <>
                              <Link to="/categories" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <LayoutDashboard size={18} /> <span className='text-sm font-bold'>Categories</span>
                              </Link>
                              <Link to="/wishlist" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <Heart size={18} /> <span className='text-sm font-bold'>My Wishlist</span>
                              </Link>
                              <Link to="/my-orders" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                                <ShoppingBag size={18} /> <span className='text-sm font-bold'>My Orders</span>
                              </Link>
                            </>
                          )}

                          <Link to="/disputes" className='flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
                            <MessageSquare size={18} /> <span className='text-sm font-bold'>Support Center</span>
                          </Link>

                          <button onClick={handleLogout} className='w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all mt-2 pt-4 border-t border-white/5'>
                            <LogOut size={18} /> <span className='text-sm font-bold'>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className='flex items-center gap-2'>
                  <Link to="/login" className='px-6 py-2.5 text-xs font-black text-white hover:text-orange-500 transition-colors uppercase tracking-widest'>Login</Link>
                  <Link to="/register" className='px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-950/20 active:scale-95'>Join Us</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className='flex md:hidden items-center gap-4'>
            {user.role === 'customer' && <CartIcon />}
            <button
              className='w-10 h-10 flex items-center justify-center text-orange-500 bg-orange-500/10 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-950/20 active:scale-95 transition-all'
              onClick={() => setOpenMenu(!openMenu)}
            >
              {openMenu ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {openMenu && (
        <div className='md:hidden absolute top-full left-0 w-full bg-slate-950 border-t border-white/5 shadow-2xl animate-in slide-in-from-top duration-300'>
          <div className='p-6 space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <NavItem href="#home" label="Home" tab="home" mobile />
              <NavItem href="#categories" label="Heritage" tab="shop" mobile />
              <NavItem href="#services" label="Benefits" tab="services" mobile />
              <NavItem href="#about" label="Our Soul" tab="about" mobile />
              <NavItem href="#contact" label="Contact" tab="contact" mobile />
            </div>

            <form onSubmit={handleSearch} className='relative group'>
              <input
                type="text"
                placeholder="Universal Discovery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] uppercase font-bold tracking-widest text-white placeholder-slate-500 focus:bg-white/10 focus:border-orange-500/50 transition-all outline-none"
              />
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors' size={18} />
            </form>

            <div className='space-y-3 pt-4 border-t border-white/5'>
              {user.token ? (
                <>
                  <div className='flex items-center gap-4 mb-4 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10'>
                    <div className='w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl'>
                      {user.name?.[0]}
                    </div>
                    <div>
                      <p className='text-white font-bold'>{user.name}</p>
                      <p className='text-[10px] text-slate-500 uppercase font-black'>{user.role}</p>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Admin Console</Link>
                      <Link to="/admin/categories" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Categories</Link>
                      <Link to="/admin/vendors" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Vendors</Link>
                      <Link to="/disputes" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Support Center</Link>
                    </>
                  )}

                  {user.role === 'vendor' && (
                    <>
                      <Link to="/vendor" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Vendor Console</Link>
                      <Link to="/categories" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Categories</Link>
                      <Link to="/disputes" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Support Center</Link>
                    </>
                  )}

                  {user.role === 'customer' && (
                    <>
                      <Link to="/categories" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Categories</Link>
                      <Link to="/wishlist" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Wishlist</Link>
                      <Link to="/my-orders" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>My Orders</Link>
                      <Link to="/disputes" className='block w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Support Center</Link>
                    </>
                  )}

                  <button onClick={handleLogout} className='w-full p-4 bg-red-500/10 text-red-500 text-sm font-black uppercase tracking-widest rounded-2xl'>Sign Out</button>
                </>
              ) : (
                <div className='flex flex-col gap-3'>
                  <Link to="/login" className='w-full p-4 text-center text-sm font-black text-white uppercase tracking-widest border border-white/10 rounded-2xl' onClick={() => setOpenMenu(false)}>Login</Link>
                  <Link to="/register" className='w-full p-4 bg-orange-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl text-center' onClick={() => setOpenMenu(false)}>Join ApexStore</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar;
