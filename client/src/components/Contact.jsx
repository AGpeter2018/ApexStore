import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Instagram, Twitter, Facebook } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <section id="contact" className="py-32 bg-black relative overflow-hidden">
            {/* Design Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[150px] rounded-full" />

            <div className="container mx-auto px-6 relative z-10 animate-fadeInUp">
                <div className="flex flex-col lg:flex-row gap-20">

                    {/* Contact Info Side */}
                    <div className="lg:w-1/3">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="text-orange-500" size={18} />
                            <h2 className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">Get In Touch</h2>
                        </div>
                        <h3 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
                            LET'S <br />
                            <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500 bg-clip-text text-transparent italic">CONNECT</span>
                        </h3>
                        <p className="text-slate-400 font-medium leading-relaxed mb-12">
                            Have questions about our artisans, products, or vendor onboarding?
                            Our team is here to support your journey into African excellence.
                        </p>

                        <div className="space-y-8">
                            <div className="group flex items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500 transition-all">
                                    <Mail className="text-orange-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Us</p>
                                    <p className="text-white font-bold text-lg">concierge@apexstore.com</p>
                                </div>
                            </div>

                            <div className="group flex items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500 transition-all">
                                    <Phone className="text-orange-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Call Us</p>
                                    <p className="text-white font-bold text-lg">+234 814 891 5475</p>
                                </div>
                            </div>

                            <div className="group flex items-start gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500 transition-all">
                                    <MapPin className="text-orange-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visit Hub</p>
                                    <p className="text-white font-bold text-lg">Lagos Tech Quarter, NI</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-16 flex items-center gap-6">
                            <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 transition-all"><Instagram size={20} /></a>
                            <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 transition-all"><Twitter size={20} /></a>
                            <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500 transition-all"><Facebook size={20} /></a>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-2/3">
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl relative">
                            {/* Glassmorphism Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                            <form action="https://formspree.io/f/movnookg"
                                method="POST" onSubmit={handleSubmit} className="relative z-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-white focus:border-orange-500/50 focus:bg-black/60 outline-none transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-white focus:border-orange-500/50 focus:bg-black/60 outline-none transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Inquiry Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-white focus:border-orange-500/50 focus:bg-black/60 outline-none transition-all"
                                        placeholder="Vendor Partnership, Custom Order, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Your Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        className="w-full bg-black/40 border border-white/5 rounded-[2rem] py-5 px-8 text-white focus:border-orange-500/50 focus:bg-black/60 outline-none transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-[0_20px_50px_-10px_rgba(234,88,12,0.4)] active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <LoadingSpinner fullPage={false} size="w-6 h-6" color="border-white" />
                                    ) : status === 'success' ? (
                                        "MESSAGE SENT"
                                    ) : (
                                        <>
                                            SEND MESSAGE
                                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
