import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { syncCart, selectCartItems } from '../redux/slices/cartSlice';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

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

            console.log(data.data)

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
        <div className="min-h-screen bg-white flex items-center justify-center py-10 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-2 flex flex-col items-center">
                    <Logo size="lg" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Curated Excellence</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest text-center">Welcome Back</h2>

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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={20} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="group text-right">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Password
                                </label>
                                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
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

                        <div className="flex items-center">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 border-2 border-gray-200 rounded-lg text-indigo-600 focus:ring-0 transition-all checked:bg-indigo-600 cursor-pointer"
                                />
                                <span className="ml-3 text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Stay Signed In</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 mt-2"
                        >
                            {loading ? 'Processing...' : 'Secure Access'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            New member?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
