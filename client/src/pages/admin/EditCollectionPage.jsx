import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Loader } from 'lucide-react';

const EditCollectionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [newMainImage, setNewMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [newGalleryImages, setNewGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const fetchCollection = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/collections/id/${id}`);
            setFormData(data.data);
            console.log(data.data)
            setLoading(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load collection' });
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewMainImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        
        const totalImages = (formData.galleryImages?.length || 0) + newGalleryImages.length + files.length;
        if (totalImages > 10) {
            setMessage({ type: 'error', text: 'Maximum 10 gallery images allowed' });
            return;
        }

        setNewGalleryImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryPreviews(prev => [...prev, reader.result]);
            };
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
            galleryImages: prev.galleryImages.filter((_, i) => i !== index)
        }));
    };

    const uploadToCloudinary = async (file, folder = 'collections') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
        formData.append('folder', `apexstore/${folder}`);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
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

            // Upload new main image if changed
            let mainImageData = formData.collectionImage;
            if (newMainImage) {
                mainImageData = await uploadToCloudinary(newMainImage);
            }

            // Upload new gallery images
            const newGalleryImagesData = [];
            for (let file of newGalleryImages) {
                const imageData = await uploadToCloudinary(file, 'collections/gallery');
                newGalleryImagesData.push(imageData);
            }
            setUploading(false);

            // Update collection
            const collectionData = {
                ...formData,
                collectionImage: mainImageData,
                galleryImages: [...(formData.galleryImages || []), ...newGalleryImagesData],
                sortOrder: Number(formData.sortOrder)
            };

            await axios.put(`${import.meta.env.VITE_API_URL}/collections/${formData._id}`, collectionData);

            setMessage({ type: 'success', text: 'Collection updated successfully!' });
            
            setTimeout(() => {
                navigate('/admin');
            }, 2000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update collection' 
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
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                        Collection not found
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Edit Collection</h1>
                    <p className="text-gray-600 mt-2">Update collection information</p>
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
                                    Collection Name *
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
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
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
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Main Collection Image</h2>
                        
                        {/* Current Image */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Image</h3>
                            <img
                                src={formData.collectionImage?.url}
                                alt={formData.name}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        </div>

                        {/* Upload New */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Change Image</h3>
                            <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Click to upload new image</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {mainImagePreview && (
                            <div className="relative mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">New Image Preview</p>
                                <img
                                    src={mainImagePreview}
                                    alt="New preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewMainImage(null);
                                        setMainImagePreview('');
                                    }}
                                    className="absolute top-8 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gallery Images */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery Images</h2>
                        
                        {/* Existing Gallery */}
                        {formData.galleryImages && formData.galleryImages.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Gallery</h3>
                                <div className="grid grid-cols-5 gap-4">
                                    {formData.galleryImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image.url}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingGalleryImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add New Gallery Images */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add More Images</h3>
                            <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Click to upload</p>
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
                            <div className="grid grid-cols-5 gap-4 mt-4">
                                {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`New ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewGalleryImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    value={formData.metaTitle || ''}
                                    onChange={handleInputChange}
                                    maxLength="60"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {(formData.metaTitle || '').length}/60 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription || ''}
                                    onChange={handleInputChange}
                                    maxLength="160"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {(formData.metaDescription || '').length}/160 characters
                                </p>
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
                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">Featured Collection</span>
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-gray-700">Active</span>
                            </label>
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
                                    Updating Collection...
                                </>
                            ) : (
                                'Update Collection'
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

export default EditCollectionPage;
