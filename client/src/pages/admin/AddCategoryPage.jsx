// ...existing code...
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader, Plus, Minus, Info } from 'lucide-react';

const AddCategoryPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]); // For parent dropdown
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: '',
        icon: '',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        featured: false,
        isActive: true,
        sortOrder: 0,
        colorTheme: {
            primary: '#F59E0B',
            secondary: '#10B981'
        },
        rules: {
            minPrice: 0,
            maxPrice: null,
            requiresVerification: false,
            commissionRate: null,
            requiresShipping: true
        }
    });

    // Attributes now follow server Category model: { group, key, type, options, unit, required, order }
    const [attributes, setAttributes] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
            // Only show main categories as parent options
            const mainCategories = (data.data || []).filter(cat => !cat.parentId || cat.level === 1);
            setCategories(mainCategories);
            console.log(import.meta.env.VITE_API_URL);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + galleryImages.length > 10) {
            setMessage({ type: 'error', text: 'Maximum 10 gallery images allowed' });
            return;
        }

        setGalleryImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeGalleryImage = (index) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Keyword management
    const addKeyword = () => {
        const kw = keywordInput.trim();
        if (kw && !formData.keywords.includes(kw)) {
            setFormData(prev => ({
                ...prev,
                keywords: [...prev.keywords, kw]
            }));
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== keyword)
        }));
    };

    // Attribute management - match server model fields
    const addAttribute = () => {
        setAttributes(prev => [...prev, {
            group: '',      // display label or group name
            key: '',        // attribute key used in product.specifications
            type: 'text',   // 'text' | 'number' | 'select' | 'multi-select'
            options: [],
            unit: '',
            required: false,
            order: prev.length
        }]);
    };

    const removeAttribute = (index) => {
        setAttributes(prev => prev.filter((_, i) => i !== index));
    };

    const updateAttribute = (index, field, value) => {
        setAttributes(prev => prev.map((attr, i) => 
            i === index ? { ...attr, [field]: value } : attr
        ));
    };

    const addAttributeOption = (attrIndex) => {
        setAttributes(prev => prev.map((attr, i) => 
            i === attrIndex 
                ? { ...attr, options: [...attr.options, ''] }
                : attr
        ));
    };

    const updateAttributeOption = (attrIndex, optIndex, value) => {
        setAttributes(prev => prev.map((attr, i) => 
            i === attrIndex 
                ? { 
                    ...attr, 
                    options: attr.options.map((opt, j) => j === optIndex ? value : opt)
                }
                : attr
        ));
    };

    const removeAttributeOption = (attrIndex, optIndex) => {
        setAttributes(prev => prev.map((attr, i) => 
            i === attrIndex 
                ? { ...attr, options: attr.options.filter((_, j) => j !== optIndex) }
                : attr
        ));
    };

    const uploadToCloudinary = async (file, folder = 'categories') => {
        const formDataCloud = new FormData();
        formDataCloud.append('file', file);
        formDataCloud.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formDataCloud.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
        formDataCloud.append('folder', `apexstore/${folder}`);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formDataCloud
            );
            return {
                url: response.data.secure_url,
                publicId: response.data.public_id,
                alt: ''
            };
        } catch (error) {
            throw new Error('Image upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (!mainImage) {
                setMessage({ type: 'error', text: 'Category image is required' });
                setLoading(false);
                return;
            }

            // Upload main image
            setUploading(true);
            const mainImageData = await uploadToCloudinary(mainImage);

            // Upload gallery images
            const galleryImagesData = [];
            for (let file of galleryImages) {
                const imageData = await uploadToCloudinary(file, 'categories/gallery');
                galleryImagesData.push(imageData);
            }
            setUploading(false);

            // Prepare category data - align attributes to model shape
            const categoryData = {
                ...formData,
                categoryImage: mainImageData,
                galleryImages: galleryImagesData,
                attributes: attributes
                    .filter(attr => attr.key && attr.group)
                    .map((attr, i) => ({
                        group: attr.group,
                        key: attr.key,
                        type: attr.type,
                        options: Array.isArray(attr.options) ? attr.options.filter(Boolean) : [],
                        unit: attr.unit || '',
                        required: Boolean(attr.required),
                        order: attr.order ?? i
                    })),
                sortOrder: Number(formData.sortOrder),
                parentId: formData.parentId || null,
                rules: {
                    ...formData.rules,
                    minPrice: Number(formData.rules.minPrice) || 0,
                    maxPrice: formData.rules.maxPrice ? Number(formData.rules.maxPrice) : null,
                    commissionRate: formData.rules.commissionRate ? Number(formData.rules.commissionRate) : null
                }
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/categories`, 
                categoryData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({ type: 'success', text: 'Category created successfully!' });
            
            setTimeout(() => {
                navigate('/admin/categories');
            }, 1200);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || error.message || 'Failed to create category' 
            });
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Add New Category</h1>
                    <p className="text-gray-600 mt-2">Create a new product category for your marketplace</p>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-800 border-l-4 border-green-500' 
                            : 'bg-red-50 text-red-800 border-l-4 border-red-500'
                    }`}>
                        <Info size={20} className="flex-shrink-0 mt-0.5" />
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="e.g., Fashion & Apparel"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Parent Category (Optional)
                                </label>
                                <select
                                    name="parentId"
                                    value={formData.parentId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">None (Main Category)</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Leave empty for main category, or select parent for subcategory
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Describe this category..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Icon Name
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="e.g., shirt, music, package"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Icon identifier from your icon library
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        name="sortOrder"
                                        value={formData.sortOrder}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Image */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Image *</h2>
                        
                        <div className="mb-4">
                            <label className="flex items-center justify-center w-full h-48 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Click to upload category image</p>
                                    <p className="text-xs text-gray-500">Recommended: 1200x600px</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                    className="hidden"
                                    required
                                />
                            </label>
                        </div>

                        {mainImagePreview && (
                            <div className="relative">
                                <img
                                    src={mainImagePreview}
                                    alt="Main preview"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMainImage(null);
                                        setMainImagePreview('');
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gallery Images */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery Images (Optional)</h2>
                        
                        <div className="mb-4">
                            <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Click to upload gallery images</p>
                                    <p className="text-xs text-gray-500">Max 10 images</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleGalleryImagesChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {galleryPreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-4">
                                {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Primary Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="colorTheme.primary"
                                        value={formData.colorTheme.primary}
                                        onChange={handleInputChange}
                                        className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.colorTheme.primary}
                                        onChange={(e) => handleInputChange({
                                            target: { name: 'colorTheme.primary', value: e.target.value }
                                        })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="#F59E0B"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Secondary Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        name="colorTheme.secondary"
                                        value={formData.colorTheme.secondary}
                                        onChange={handleInputChange}
                                        className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.colorTheme.secondary}
                                        onChange={(e) => handleInputChange({
                                            target: { name: 'colorTheme.secondary', value: e.target.value }
                                        })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="#10B981"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Attributes (aligned with server model) */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Product Attributes</h2>
                                <p className="text-sm text-gray-600 mt-1">Define fields that products in this category should have</p>
                            </div>
                            <button
                                type="button"
                                onClick={addAttribute}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add Attribute
                            </button>
                        </div>

                        {attributes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No attributes added yet</p>
                                <p className="text-sm mt-2">Attributes define what information products in this category should have</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {attributes.map((attr, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">Attribute {index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeAttribute(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Minus size={18} />
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Group / Label *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={attr.group}
                                                    onChange={(e) => updateAttribute(index, 'group', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="e.g., Size, Material"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Field Key *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={attr.key}
                                                    onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="e.g., size, material"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Used in product spec key (no spaces)</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={attr.type}
                                                    onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="select">Select (Dropdown)</option>
                                                    <option value="multi-select">Multi-select</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(attr.type === 'select' || attr.type === 'multi-select') && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Options
                                                </label>
                                                {attr.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => updateAttributeOption(index, optIndex, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            placeholder={`Option ${optIndex + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttributeOption(index, optIndex)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addAttributeOption(index)}
                                                    className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1"
                                                >
                                                    <Plus size={14} />
                                                    Add Option
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4 items-center">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={attr.unit}
                                                    onChange={(e) => updateAttribute(index, 'unit', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="e.g., cm, kg"
                                                />
                                            </div>

                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={attr.required}
                                                    onChange={(e) => updateAttribute(index, 'required', e.target.checked)}
                                                    className="w-4 h-4 text-orange-600 rounded"
                                                />
                                                <span className="text-sm text-gray-700">Required field</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category Rules */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Rules</h2>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Minimum Price (₦)
                                    </label>
                                    <input
                                        type="number"
                                        name="rules.minPrice"
                                        value={formData.rules.minPrice}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Maximum Price (₦)
                                    </label>
                                    <input
                                        type="number"
                                        name="rules.maxPrice"
                                        value={formData.rules.maxPrice || ''}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="No limit"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Commission Rate (%)
                                </label>
                                <input
                                    type="number"
                                    name="rules.commissionRate"
                                    value={formData.rules.commissionRate || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Leave empty for platform default (12%)"
                                />
                            </div>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="rules.requiresVerification"
                                    checked={formData.rules.requiresVerification}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-orange-600 rounded"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Requires Verification</span>
                                    <p className="text-xs text-gray-500">Products need admin approval before going live</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="rules.requiresShipping"
                                    checked={formData.rules.requiresShipping}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-orange-600 rounded"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Requires Shipping</span>
                                    <p className="text-xs text-gray-500">Physical products that need delivery</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">SEO Settings</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleInputChange}
                                    maxLength="60"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="SEO title for search engines"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {formData.metaTitle.length}/60 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                    maxLength="160"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="SEO description for search engines"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {formData.metaDescription.length}/160 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Keywords
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Add keyword and press Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={addKeyword}
                                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                {formData.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formData.keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() => removeKeyword(keyword)}
                                                    className="hover:text-orange-900"
                                                >
                                                    <X size={14} />
                                                </button>
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
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-orange-600 rounded"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Featured Category</span>
                                    <p className="text-xs text-gray-500">Show this category prominently on homepage</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-orange-600 rounded"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Active</span>
                                    <p className="text-xs text-gray-500">Make this category visible to customers</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Uploading Images...
                                </>
                            ) : loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Creating Category...
                                </>
                            ) : (
                                'Create Category'
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/admin/categories')}
                            className="px-8 py-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryPage;
// ...existing code...