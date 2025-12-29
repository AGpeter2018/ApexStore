import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { syncCart, selectCartItems } from '../redux/slices/cartSlice';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const localCartItems = useSelector(selectCartItems);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/login`,
                formData
            );

            // Store token and user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));

            // Sync cart if user is a customer
            if (data.data.role === 'customer' && localCartItems.length > 0) {
                const itemsToSync = localCartItems.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity
                }));
                await dispatch(syncCart(itemsToSync));
            }

            setSuccessMessage('SignIn successfully')
            // Redirect based on role
            setTimeout(() => {
                if (data.data.role === 'admin') {
                    navigate('/admin');
                } else if (data.data.role === 'vendor') {
                    navigate('/vendor');
                } else {
                    navigate('/categories');
                }
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-8 px-4">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <svg className='h-20 w-20 mx-auto' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
                    <div className='text-xl font-bold font-serif tracking-tight cursor-pointer pl-0'>
                        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                            ApexStore
                        </span>
                    </div>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border-l-4 border-red-500 text-green-700 p-4 rounded mb-6">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Accounts */}
                <div className="mt-8 bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 font-semibold mb-2">Demo Accounts:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>Admin: admin@apexstore.com / password123</p>
                        <p>Vendor: vendor@apexstore.com / password123</p>
                        <p>Customer: customer@apexstore.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
