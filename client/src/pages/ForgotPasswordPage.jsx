import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
                { email }
            );

            setMessage({ type: 'success', text: data.message });
            setSubmitted(true);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send reset email'
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60"></div>
                </div>

                <div className="max-w-md w-full relative z-10">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-100/50">
                            <CheckCircle size={40} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Check Your Inbox</h2>
                        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed italic border-l-4 border-emerald-100 pl-4 text-left">
                            We've sent a secure recovery link to <span className="text-emerald-600 font-black">{email}</span>. Please verify your identity via the email.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Secure Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-12 flex flex-col items-center">
                    <Logo size="lg" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Recover Access</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 border border-gray-100 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-widest">Forgot Password?</h2>

                    {message.text && (
                        <div className={`p-4 rounded-2xl mb-8 text-sm font-bold tracking-tight ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 text-left">
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm tracking-tight"
                                    placeholder="Enter registered email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-indigo-100 hover:shadow-indigo-200"
                        >
                            {loading ? 'Sending Request...' : 'Get Recovery Link'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                        >
                            <ArrowLeft size={16} strokeWidth={3} />
                            Return to Authentication
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;