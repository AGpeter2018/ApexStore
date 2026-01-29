import { useState, useEffect } from 'react';
import { categoryAPI } from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Upload, X, Loader, Plus, Minus, Info, AlertCircle } from 'lucide-react';

const EditCategoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');

    const [newMainImage, setNewMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [newGalleryImages, setNewGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCategories();
        fetchCategory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchCategories = async () => {
        try {
            const { data } = await categoryAPI.getCategories();
            const list = data.data || [];
            const mainCategories = list.filter(cat => (!cat.parentId || cat.level === 1) && String(cat._id) !== String(id));
            setCategories(mainCategories);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchCategory = async () => {
        try {
            const { data } = await categoryAPI.getCategoryById(id);
            const category = data.data;

            setFormData({
                ...category,
                parentId: category.parentId || '',
                colorTheme: category.colorTheme || {
                    primary: '#F59E0B',
                    secondary: '#10B981'
                },
                rules: category.rules || {
                    minPrice: 0,
                    maxPrice: null,
                    requiresVerification: false,
                    commissionRate: null,
                    requiresShipping: true
                }
            });

            // Normalize attributes to new model: { group, key, type, options, unit, required, order }
            const normalizedAttrs = (category.attributes || []).map((a, idx) => ({
                group: a.group || 'General',
                key: a.key || a.name || (a.label ? a.label.toLowerCase().replace(/\s+/g, '_') : ''),
                label: a.label || a.name || '',
                type: (a.type || 'text').replace('multiselect', 'multi-select'),
                options: Array.isArray(a.options) ? a.options : (a.options ? [a.options] : []),
                unit: a.unit || '',
                required: Boolean(a.required),
                order: a.order ?? idx
            }));
            setAttributes(normalizedAttrs);
            setKeywords(category.keywords || []);
            setLoading(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load category' });
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev?.[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewMainImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setMainImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        const totalImages = (formData?.galleryImages?.length || 0) + newGalleryImages.length + files.length;
        if (totalImages > 10) {
            setMessage({ type: 'error', text: 'Maximum 10 gallery images allowed' });
            return;
        }

        setNewGalleryImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setGalleryPreviews(prev => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
    };

    const removeNewGalleryImage = (index) => {
        setNewGalleryImages(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index)
        }));
    };

    // Keywords
    const addKeyword = () => {
        const kw = keywordInput.trim();
        if (kw && !keywords.includes(kw)) {
            setKeywords(prev => [...prev, kw]);
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword) => setKeywords(prev => prev.filter(k => k !== keyword));

    // Attributes (new model)
    const addAttribute = () => {
        setAttributes(prev => [...prev, {
            group: 'General',
            key: '',
            label: '',
            type: 'text',
            options: [],
            unit: '',
            required: false,
            order: prev.length
        }]);
    };

    const removeAttribute = (index) => setAttributes(prev => prev.filter((_, i) => i !== index));

    const updateAttribute = (index, field, value) => {
        setAttributes(prev => prev.map((attr, i) => i === index ? { ...attr, [field]: value } : attr));
    };

    const addAttributeOption = (attrIndex) => {
        setAttributes(prev => prev.map((attr, i) => i === attrIndex ? { ...attr, options: [...(attr.options || []), ''] } : attr));
    };

    const updateAttributeOption = (attrIndex, optIndex, value) => {
        setAttributes(prev => prev.map((attr, i) => i === attrIndex ? { ...attr, options: attr.options.map((o, j) => j === optIndex ? value : o) } : attr));
    };

    const removeAttributeOption = (attrIndex, optIndex) => {
        setAttributes(prev => prev.map((attr, i) => i === attrIndex ? { ...attr, options: attr.options.filter((_, j) => j !== optIndex) } : attr));
    };

    const uploadToCloudinary = async (file, folder = 'categories') => {
        const formDataCloud = new FormData();
        formDataCloud.append('file', file);
        formDataCloud.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formDataCloud.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
        formDataCloud.append('folder', `apexstore/${folder}`);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formDataCloud
        );
        return {
            url: response.data.secure_url,
            publicId: response.data.public_id,
            alt: ''
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            setUploading(true);

            // upload main image if changed
            let mainImageData = formData?.categoryImage;
            if (newMainImage) mainImageData = await uploadToCloudinary(newMainImage);

            // upload new gallery images
            const newGalleryImagesData = [];
            for (const file of newGalleryImages) {
                const imageData = await uploadToCloudinary(file, 'categories/gallery');
                newGalleryImagesData.push(imageData);
            }

            setUploading(false);

            const mappedAttributes = attributes
                .filter(a => a.key && a.label)
                .map((a, idx) => ({
                    group: a.group || 'General',
                    key: a.key,
                    label: a.label,
                    type: a.type,
                    options: Array.isArray(a.options) ? a.options.filter(Boolean) : [],
                    unit: a.unit || '',
                    required: Boolean(a.required),
                    order: a.order ?? idx
                }));

            const payload = {
                ...formData,
                categoryImage: mainImageData,
                galleryImages: [...(formData.galleryImages || []), ...newGalleryImagesData],
                attributes: mappedAttributes,
                keywords,
                sortOrder: Number(formData.sortOrder) || 0,
                parentId: formData.parentId || null,
                rules: {
                    ...formData.rules,
                    minPrice: Number(formData.rules?.minPrice) || 0,
                    maxPrice: formData.rules?.maxPrice ? Number(formData.rules.maxPrice) : null,
                    commissionRate: formData.rules?.commissionRate ? Number(formData.rules.commissionRate) : null
                }
            };

            await categoryAPI.updateCategory(id, payload);

            setMessage({ type: 'success', text: 'Category updated successfully!' });
            setTimeout(() => navigate('/admin/categories'), 1200);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update category' });
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                        <div>
                            <h3 className="font-semibold text-red-800">Category not found</h3>
                            <button onClick={() => navigate('/admin/categories')} className="mt-2 text-red-700 underline hover:text-red-800">Back to categories</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Edit Category</h1>
                    <p className="text-gray-600 mt-2">Update category: {formData.name}</p>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'
                        }`}>
                        <Info size={20} className="flex-shrink-0 mt-0.5" />
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category (Optional)</label>
                                <select name="parentId" value={formData.parentId} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                    <option value="">None (Main Category)</option>
                                    {categories.map(cat => <option key={String(cat._id)} value={String(cat._id)}>{cat.name}</option>)}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">Current level: {formData.level === 1 ? 'Main Category' : 'Subcategory'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleInputChange} required rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Name</label>
                                    <input type="text" name="icon" value={formData.icon || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g., shirt, music, package" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
                                    <input type="number" name="sortOrder" value={formData.sortOrder ?? 0} onChange={handleInputChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Image</h2>
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Image</h3>
                            {formData.categoryImage?.url ? (
                                <img src={formData.categoryImage.url} alt={formData.name} className="w-full h-48 object-cover rounded-lg" />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center"><p className="text-gray-500">No image</p></div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Change Image</h3>
                            <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Click to upload new image</p>
                                </div>
                                <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                            </label>
                        </div>

                        {mainImagePreview && (
                            <div className="relative mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">New Image Preview</p>
                                <img src={mainImagePreview} alt="New preview" className="w-full h-48 object-cover rounded-lg" />
                                <button type="button" onClick={() => { setNewMainImage(null); setMainImagePreview(''); }} className="absolute top-8 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"><X size={16} /></button>
                            </div>
                        )}
                    </div>

                    {/* Gallery */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery Images</h2>

                        {formData.galleryImages && formData.galleryImages.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Gallery</h3>
                                <div className="grid grid-cols-5 gap-4">
                                    {(formData.galleryImages || []).map((image, index) => (
                                        <div key={index} className="relative">
                                            <img src={image.url} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                            <button type="button" onClick={() => removeExistingGalleryImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add More Images</h3>
                            <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Click to upload (Max 10 total)</p>
                                </div>
                                <input type="file" multiple accept="image/*" onChange={handleGalleryImagesChange} className="hidden" />
                            </label>
                        </div>

                        {galleryPreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-4 mt-4">
                                {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img src={preview} alt={`New ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                        <button type="button" onClick={() => removeNewGalleryImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color Theme */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Theme</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                                <div className="flex gap-2">
                                    <input type="color" name="colorTheme.primary" value={formData.colorTheme?.primary || '#F59E0B'} onChange={handleInputChange} className="w-16 h-10 border border-gray-300 rounded cursor-pointer" />
                                    <input type="text" value={formData.colorTheme?.primary || ''} onChange={(e) => handleInputChange({ target: { name: 'colorTheme.primary', value: e.target.value } })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                                <div className="flex gap-2">
                                    <input type="color" name="colorTheme.secondary" value={formData.colorTheme?.secondary || '#10B981'} onChange={handleInputChange} className="w-16 h-10 border border-gray-300 rounded cursor-pointer" />
                                    <input type="text" value={formData.colorTheme?.secondary || ''} onChange={(e) => handleInputChange({ target: { name: 'colorTheme.secondary', value: e.target.value } })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attributes (new model) */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Product Attributes</h2>
                                <p className="text-sm text-gray-600 mt-1">Define fields for products in this category</p>
                            </div>
                            <button type="button" onClick={addAttribute} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus size={18} />Add Attribute</button>
                        </div>

                        {attributes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg"><p>No attributes defined</p></div>
                        ) : (
                            <div className="space-y-6">
                                {attributes.map((attr, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">Attribute {index + 1}</h3>
                                            <button type="button" onClick={() => removeAttribute(index)} className="text-red-600 hover:text-red-700"><Minus size={18} /></button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                                                <input type="text" value={attr.label} onChange={(e) => updateAttribute(index, 'label', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" placeholder="e.g., Screen Size" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Key *</label>
                                                <input type="text" value={attr.key} onChange={(e) => updateAttribute(index, 'key', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" placeholder="e.g., screen_size" />
                                                <p className="text-xs text-gray-400 mt-1">Used in system (no spaces)</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                                                <input type="text" value={attr.group} onChange={(e) => updateAttribute(index, 'group', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" placeholder="e.g., General" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select value={attr.type} onChange={(e) => updateAttribute(index, 'type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                                    <option value="text">Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="select">Select (Dropdown)</option>
                                                    <option value="multi-select">Multi-select</option>
                                                    <option value="boolean">Boolean (Yes/No)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (optional)</label>
                                                <input type="text" value={attr.unit || ''} onChange={(e) => updateAttribute(index, 'unit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" placeholder="e.g., cm, kg" />
                                            </div>
                                        </div>

                                        {(attr.type === 'select' || attr.type === 'multi-select') && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                                {(attr.options || []).map((option, optIndex) => (
                                                    <div key={optIndex} className="flex gap-2 mb-2">
                                                        <input type="text" value={option} onChange={(e) => updateAttributeOption(index, optIndex, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" placeholder={`Option ${optIndex + 1}`} />
                                                        <button type="button" onClick={() => removeAttributeOption(index, optIndex)} className="text-red-600 hover:text-red-700"><X size={18} /></button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addAttributeOption(index)} className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1"><Plus size={14} />Add Option</button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={attr.required} onChange={(e) => updateAttribute(index, 'required', e.target.checked)} className="w-4 h-4 text-orange-600 rounded" />
                                            <span className="text-sm text-gray-700">Required field</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rules */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Rules</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Price (₦)</label>
                                    <input type="number" name="rules.minPrice" value={formData.rules?.minPrice ?? 0} onChange={handleInputChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Price (₦)</label>
                                    <input type="number" name="rules.maxPrice" value={formData.rules?.maxPrice ?? ''} onChange={handleInputChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="No limit" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Rate (%)</label>
                                <input type="number" name="rules.commissionRate" value={formData.rules?.commissionRate ?? ''} onChange={handleInputChange} min="0" max="100" step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Leave empty for platform default" />
                            </div>

                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="rules.requiresVerification" checked={formData.rules?.requiresVerification || false} onChange={handleInputChange} className="w-5 h-5 text-orange-600 rounded" />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Requires Verification</span>
                                    <p className="text-xs text-gray-500">Products need admin approval</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="rules.requiresShipping" checked={formData.rules?.requiresShipping || false} onChange={handleInputChange} className="w-5 h-5 text-orange-600 rounded" />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Requires Shipping</span>
                                    <p className="text-xs text-gray-500">Physical products</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">SEO Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title</label>
                                <input type="text" name="metaTitle" value={formData.metaTitle || ''} onChange={handleInputChange} maxLength="60" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                <p className="text-sm text-gray-500 mt-1">{(formData.metaTitle || '').length}/60 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                                <textarea name="metaDescription" value={formData.metaDescription || ''} onChange={handleInputChange} maxLength="160" rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                <p className="text-sm text-gray-500 mt-1">{(formData.metaDescription || '').length}/160 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" placeholder="Add keyword and press Enter" />
                                    <button type="button" onClick={addKeyword} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Add</button>
                                </div>
                                {keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {keywords.map((keyword, idx) => (
                                            <span key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                {keyword}
                                                <button type="button" onClick={() => removeKeyword(keyword)} className="hover:text-orange-900"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleInputChange} className="w-5 h-5 text-orange-600 rounded" />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Featured Category</span>
                                    <p className="text-xs text-gray-500">Show prominently on homepage</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleInputChange} className="w-5 h-5 text-orange-600 rounded" />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Active</span>
                                    <p className="text-xs text-gray-500">Make visible to customers</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button type="submit" disabled={saving || uploading} className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                            {uploading ? (<><Loader className="animate-spin" size={20} />Uploading Images...</>) : saving ? (<><Loader className="animate-spin" size={20} />Updating Category...</>) : ('Update Category')}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/categories')} className="px-8 py-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategoryPage;
// ...existing code...