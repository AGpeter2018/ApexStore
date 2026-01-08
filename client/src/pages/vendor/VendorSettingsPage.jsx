import { useState, useEffect } from 'react';
import { vendorAPI } from '../../utils/api';
import { Store, MapPin, Globe, Image as ImageIcon, Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorSettingsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        location: '',
        businessAddress: '',
        logo: '',
        socials: {
            facebook: '',
            instagram: '',
            twitter: '',
            website: ''
        }
    });

    useEffect(() => {
        fetchVendorData();
    }, []);

    const fetchVendorData = async () => {
        try {
            const { data } = await vendorAPI.getMyVendor();
            if (data.success) {
                const vendor = data.data;
                setFormData({
                    storeName: vendor.storeName || '',
                    storeDescription: vendor.storeDescription || '',
                    location: vendor.location || '',
                    businessAddress: vendor.businessAddress || '',
                    logo: vendor.logo || '',
                    socials: {
                        facebook: vendor.socials?.facebook || '',
                        instagram: vendor.socials?.instagram || '',
                        twitter: vendor.socials?.twitter || '',
                        website: vendor.socials?.website || ''
                    }
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vendor data:', error);
            setMessage({ type: 'error', text: 'Failed to load store settings' });
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await vendorAPI.updateMyVendor(formData);
            if (data.success) {
                setMessage({ type: 'success', text: 'Store profile updated successfully!' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update store settings' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage your public store profile and business details.</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="font-bold text-sm">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <Store className="text-orange-500" size={24} />
                                Basic Store Information
                            </h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                        placeholder="Enter store name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location (Region/State)</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                        placeholder="e.g. Lagos, Nigeria"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Store Description</label>
                                <textarea
                                    name="storeDescription"
                                    value={formData.storeDescription}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                    placeholder="Tell customers what your store is about..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Business Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="businessAddress"
                                        value={formData.businessAddress}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                        placeholder="Full business address"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding & Logo */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <ImageIcon className="text-blue-500" size={24} />
                                Branding
                            </h2>
                        </div>
                        <div className="p-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Logo URL</label>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            name="logo"
                                            value={formData.logo}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium mb-2"
                                            placeholder="https://example.com/logo.png"
                                        />
                                        <p className="text-xs text-gray-500">Provide an image URL for your store logo.</p>
                                    </div>
                                    <div className="shrink-0">
                                        <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            {formData.logo ? (
                                                <img src={formData.logo} alt="Store Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={32} className="text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <Globe className="text-purple-500" size={24} />
                                Social Media & Online Presence
                            </h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                                <input
                                    type="text"
                                    name="socials.website"
                                    value={formData.socials.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                                    placeholder="yourwebsite.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Instagram</label>
                                <input
                                    type="text"
                                    name="socials.instagram"
                                    value={formData.socials.instagram}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-medium"
                                    placeholder="@yourhandle"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Facebook</label>
                                <input
                                    type="text"
                                    name="socials.facebook"
                                    value={formData.socials.facebook}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                    placeholder="facebook.com/yourstore"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Twitter / X</label>
                                <input
                                    type="text"
                                    name="socials.twitter"
                                    value={formData.socials.twitter}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 font-medium"
                                    placeholder="@yourhandle"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorSettingsPage;
