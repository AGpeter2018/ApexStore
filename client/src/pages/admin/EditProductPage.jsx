import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Plus, Loader, Trash2 } from 'lucide-react';

const EditProductPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [formData, setFormData] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const drumTypes = ['Talking Drum (Gangan)', 'Bata Drum', 'Dundun', 'Sakara', 'Agogo', 'Bembe', 'Other'];
    const materialOptions = ['Cowhide', 'Goatskin', 'Wood', 'Leather Straps', 'Metal Rings', 'Rope', 'Other'];
    const skinTypes = ['Cowhide', 'Goatskin', 'Mixed'];
    const tuningTypes = ['Pre-tuned', 'Adjustable', 'Fixed'];

    useEffect(() => {
        fetchProduct();
        fetchCollections();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products/${slug}`);
            setFormData({
                ...data.data,
                collection: data.data.collection._id,
                tags: data.data.tags?.join(', ') || '',
                features: data.data.features?.length > 0 ? data.data.features : ['']
            });
            console.log(formData)
            setLoading(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load product' });
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/collections`);
            setCollections(data.data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleMaterialToggle = (material) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.includes(material)
                ? prev.materials.filter(m => m !== material)
                : [...prev.materials, material]
        }));
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + formData.images.length + newImages.length > 5) {
            setMessage({ type: 'error', text: 'Maximum 5 images allowed' });
            return;
        }

        setNewImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = async (imageId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/products/${slug}/image/${imageId}`);
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter(img => img._id !== imageId)
            }));
            setMessage({ type: 'success', text: 'Image deleted successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete image' });
        }
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
        formData.append('folder', 'apexstore/products');

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );
        return {
            url: response.data.secure_url,
            publicId: response.data.public_id,
            alt: formData.name
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Upload new images if any
            let uploadedImages = [];
            if (newImages.length > 0) {
                setUploading(true);
                for (let file of newImages) {
                    const imageData = await uploadToCloudinary(file);
                    uploadedImages.push(imageData);
                }
                setUploading(false);
            }

            // Prepare product data
            const productData = {
                ...formData,
                id: formData._id,
                images: [...formData.images, ...uploadedImages],
                price: Number(formData.price),
                compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
                stock: Number(formData.stock),
                dimensions: {
                    height: formData.dimensions?.height ? Number(formData.dimensions.height) : undefined,
                    diameter: formData.dimensions?.diameter ? Number(formData.dimensions.diameter) : undefined,
                    weight: formData.dimensions?.weight ? Number(formData.dimensions.weight) : undefined
                },
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                features: formData.features.filter(f => f.trim() !== '')
            };

            // Update product
            await axios.put(`${import.meta.env.VITE_API_URL}/products/${formData._id}`, productData);

            setMessage({ type: 'success', text: 'Product updated successfully!' });
            
            setTimeout(() => {
                navigate('/admin');
            }, 2000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update product' 
            });
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                        Product not found
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-600 mt-2">Update product information</p>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={formData.shortDescription || ''}
                                    onChange={handleInputChange}
                                    maxLength="200"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="6"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Inventory</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Price (₦) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Compare At Price (₦)
                                </label>
                                <input
                                    type="number"
                                    name="compareAtPrice"
                                    value={formData.compareAtPrice || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Drum Details - Similar structure as Add Product */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Drum Details</h2>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Drum Type *
                                    </label>
                                    <select
                                        name="drumType"
                                        value={formData.drumType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Select Type</option>
                                        {drumTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Collection *
                                    </label>
                                    <select
                                        name="collection"
                                        value={formData.collection}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Select Collection</option>
                                        {collections.map(col => (
                                            <option key={col._id} value={col._id}>{col.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Materials Used
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {materialOptions.map(material => (
                                        <button
                                            key={material}
                                            type="button"
                                            onClick={() => handleMaterialToggle(material)}
                                            className={`px-4 py-2 rounded-lg border transition-colors ${
                                                formData.materials?.includes(material)
                                                    ? 'bg-orange-500 text-white border-orange-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                                            }`}
                                        >
                                            {material}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images Management */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Images</h2>
                        
                        {/* Existing Images */}
                        {formData.images && formData.images.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Current Images</h3>
                                <div className="grid grid-cols-5 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={image._id || index} className="relative">
                                            <img
                                                src={image.url}
                                                alt={image.alt}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            {image.isPrimary && (
                                                <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                                                    Primary
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(image._id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload New Images */}
                        {formData.images.length < 5 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Add New Images</h3>
                                <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">Click to upload</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleNewImageChange}
                                        className="hidden"
                                    />
                                </label>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-4 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
                        
                        <div className="space-y-3">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                            >
                                <Plus size={20} />
                                Add Feature
                            </button>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="flex-1 bg-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Uploading Images...
                                </>
                            ) : saving ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Updating Product...
                                </>
                            ) : (
                                'Update Product'
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
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

export default EditProductPage;