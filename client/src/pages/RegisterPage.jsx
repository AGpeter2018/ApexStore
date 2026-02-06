import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Eye, EyeOff, Phone, Store, Shield, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';


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
        storeDescription: '',
        location: '',
        businessAddress: '',
        socials: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        }

    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target

        if (['facebook', 'twitter', 'instagram', 'linkedin'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                socials: {
                    ...prev.socials,
                    [name]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev, [name]: value
            }))
        }
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
                    phone: formData.role === 'vendor' ? formData.phone : undefined,
                    role: formData.role,
                    storeName: formData.role === 'vendor' ? formData.storeName : undefined,
                    storeDescription: formData.role === 'vendor' ? formData.storeDescription : undefined,
                    location: formData.role === 'vendor' ? formData.location : undefined,
                    businessAddress: formData.role === 'vendor' ? formData.businessAddress : undefined,
                    socials: {
                        facebook: formData.role === 'vendor' ? formData.socials.facebook : undefined,
                        twitter: formData.role === 'vendor' ? formData.socials.twitter : undefined,
                        instagram: formData.role === 'vendor' ? formData.socials.instagram : undefined,
                        linkedin: formData.role === 'vendor' ? formData.socials.linkedin : undefined,
                    }
                }
            );

            console.log(data.data)

            // Store token and user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));

            setSuccessMessage('Account created successfully! Redirecting...')
            // Redirect based on role
            setTimeout(() => {
                if (data.data.role === 'admin') {
                    navigate('/admin')
                } else if (data.data.role === 'vendor') {
                    navigate('/vendor/');
                } else {
                    navigate('/categories');
                }
            }, 2500)
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="max-w-2xl w-full relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-12 flex flex-col items-center">
                    <Logo size="lg" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Join the Excellence</p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= 1
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110'
                            : 'bg-gray-50 text-gray-300 border border-gray-100'
                            }`}>
                            1
                        </div>
                        <div className="w-16 sm:w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100 italic">
                            <div className={`h-full bg-indigo-600 transition-all duration-700 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= 2
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110'
                            : 'bg-gray-50 text-gray-300 border border-gray-100'
                            }`}>
                            2
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 border border-gray-100">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 flex items-center justify-center text-sm font-bold tracking-tight">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl mb-8 flex items-center justify-center text-sm font-bold tracking-tight uppercase tracking-widest">
                            <Lock className="mr-2" size={16} />
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest text-center">Creator Profile</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600">
                                                <User size={20} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600">
                                                <Mail size={20} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Password</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600">
                                                <Lock size={20} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-14 pr-14 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Confirm Access</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600">
                                                <Lock size={20} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-14 pr-14 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 mt-4 cursor-pointer"
                                >
                                    Continue to Settings
                                </button>
                            </div>
                        )}

                        {/* Step 2: Role & Additional Info */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Account Type</h2>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                        ← Go Back
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'customer' })}
                                        className={`group p-8 rounded-[2rem] border-2 transition-all cursor-pointer text-left relative overflow-hidden ${formData.role === 'customer'
                                            ? 'border-indigo-600 bg-indigo-50/50'
                                            : 'border-gray-50 bg-gray-50/30 hover:border-indigo-200'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${formData.role === 'customer' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}>
                                            <User size={28} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="font-black text-gray-900 text-xl mb-2 uppercase tracking-tight">Customer</h3>
                                        <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-wide opacity-70">Browse & Collect Unique Pieces</p>
                                        {formData.role === 'customer' && <div className="absolute top-4 right-4 text-indigo-600"><Sparkles size={16} /></div>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'vendor' })}
                                        className={`group p-8 rounded-[2rem] border-2 transition-all cursor-pointer text-left relative overflow-hidden ${formData.role === 'vendor'
                                            ? 'border-violet-600 bg-violet-50/50'
                                            : 'border-gray-50 bg-gray-50/30 hover:border-violet-200'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${formData.role === 'vendor' ? 'bg-violet-600 text-white' : 'bg-white text-gray-400'}`}>
                                            <Store size={28} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="font-black text-gray-900 text-xl mb-2 uppercase tracking-tight">Vendor</h3>
                                        <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-wide opacity-70">Sell your curated creations</p>
                                        {formData.role === 'vendor' && <div className="absolute top-4 right-4 text-violet-600"><Sparkles size={16} /></div>}
                                    </button>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600">
                                            <Phone size={20} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                            placeholder="+234 801 234 5678"
                                        />
                                    </div>
                                </div>

                                {/* vendor-specific fields */}
                                {formData.role === 'vendor' && (
                                    <div className="space-y-6 pt-6 border-t border-gray-100">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Store Name *</label>
                                            <div className="relative">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-violet-600">
                                                    <Store size={20} strokeWidth={2.5} />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="storeName"
                                                    value={formData.storeName}
                                                    onChange={handleChange}
                                                    required={formData.role === 'vendor'}
                                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-violet-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                                    placeholder="The Curated Collective"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="group">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Store Description</label>
                                                <textarea
                                                    name="storeDescription"
                                                    value={formData.storeDescription}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-violet-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight resize-none"
                                                    placeholder="Tell us your story..."
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Business Address</label>
                                                <textarea
                                                    name="businessAddress"
                                                    value={formData.businessAddress}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-violet-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight resize-none"
                                                    placeholder="Your headquarters..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start bg-gray-50 rounded-2xl p-6 border border-gray-100 italic">
                                    <input
                                        type="checkbox"
                                        required
                                        className="w-5 h-5 mt-0.5 border-2 border-gray-200 rounded-lg text-indigo-600 focus:ring-0 transition-all checked:bg-indigo-600 cursor-pointer"
                                    />
                                    <label className="ml-4 text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                        I accept the{' '}
                                        <Link to="/terms" className="text-indigo-600 hover:text-indigo-700">Digital Service Terms</Link>
                                        {' '} &{' '}
                                        <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700">Privacy Charter</Link>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 cursor-pointer"
                                >
                                    {loading ? 'Finalizing Setup...' : 'Initialize Account'}
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Already a member?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors font-black">
                                Sign In Securely
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 text-center border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Shield size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Encrypted</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">256-bit Security</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 text-center border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Instant</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Start System</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 text-center border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <User size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Curated</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exclusive Access</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
