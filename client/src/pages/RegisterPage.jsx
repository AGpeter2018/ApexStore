import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Eye, EyeOff, Phone, Store } from 'lucide-react';


const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'customer',
        storeName: '',
        storeDescription: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleNext = () => {
        setError('');
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/register`,
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    role: formData.role,
                    storeName: formData.role === 'vendor' ? formData.storeName : undefined,
                    storeDescription: formData.role === 'vendor' ? formData.storeDescription : undefined
                }
            );

            // Store token and user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));

            setSuccessMessage('Account created successfully! Redirecting...')
            // Redirect based on role
            setTimeout(() => {
                if (data.data.role === 'admin') {
                    navigate('/admin')
                } else if (data.data.role === 'vendor') {
                    navigate('/vendor/dashboard');
                } else {
                    navigate('/collections');
                }
            }, 2500)
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full">
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
                    <p className="text-gray-600 mt-2">Create your account</p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                            1
                        </div>
                        <div className={`w-24 h-1 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                            2
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
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
                                        Password *
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
                                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                                >
                                    Next Step
                                </button>
                            </div>
                        )}

                        {/* Step 2: Role & Additional Info */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Account Type</h2>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                                    >
                                        ← Back
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        I want to register as: *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'customer' })}
                                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${formData.role === 'customer'
                                                ? 'border-orange-600 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-300'
                                                }`}
                                        >
                                            <User size={32} className={`mx-auto mb-3 ${formData.role === 'customer' ? 'text-orange-600' : 'text-gray-400'
                                                }`} />
                                            <h3 className="font-bold text-lg mb-2">Customer</h3>
                                            <p className="text-sm text-gray-600">Browse and purchase drums</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'vendor' })}
                                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${formData.role === 'vendor'
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <Store size={32} className={`mx-auto mb-3 ${formData.role === 'vendor' ? 'text-blue-600' : 'text-gray-400'
                                                }`} />
                                            <h3 className="font-bold text-lg mb-2">Vendor</h3>
                                            <p className="text-sm text-gray-600">Sell your drums online</p>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="+234 801 234 5678"
                                        />
                                    </div>
                                </div>

                                {/* vendor-specific fields */}
                                {formData.role === 'vendor' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Store Name *
                                            </label>
                                            <div className="relative">
                                                <Store className="absolute left-3 top-3 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    name="storeName"
                                                    value={formData.storeName}
                                                    onChange={handleChange}
                                                    required={formData.role === 'vendor'}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="My Drum Store"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Store Description
                                            </label>
                                            <textarea
                                                name="storeDescription"
                                                value={formData.storeDescription}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="Tell us about your store..."
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        required
                                        className="w-4 h-4 mt-1 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <label className="ml-2 text-sm text-gray-600">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-orange-600 hover:text-orange-700">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy" className="text-orange-600 hover:text-orange-700">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 cursor-pointer"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">✓</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
                        <p className="text-xs text-gray-600">Your data is protected</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">���</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Fast Setup</h3>
                        <p className="text-xs text-gray-600">Start in minutes</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">���</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Free</h3>
                        <p className="text-xs text-gray-600">No credit card required</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
