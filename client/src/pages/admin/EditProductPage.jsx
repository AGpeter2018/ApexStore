import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, X, Plus, Loader, AlertCircle, CheckCircle, Package, ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import { adminAPI, categoryAPI, productAPI } from '../../utils/api';
import AIAssistantModal from '../../components/AIAssistantModal';

const EditProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productId, setProductId] = useState(null); // Get from URL params

  const [formData, setFormData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [specFields, setSpecFields] = useState([]);

  useEffect(() => {
    setProductId(id);
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (formData?.categoryId) {
      fetchSubcategories(formData.categoryId);

      // If we have a subcategory, load its attributes, otherwise load category attributes
      if (formData.subcategoryId) {
        loadCategoryAttributes(formData.subcategoryId);
      } else {
        loadCategoryAttributes(formData.categoryId);
      }
    }
  }, [formData?.categoryId, formData?.subcategoryId, categories, subcategories]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchCategories(),
        fetchVendors(),
        fetchProduct(id)
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories({ parentId: 'null', isActive: 'true' });

      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await categoryAPI.getCategories({ parentId: categoryId, isActive: 'true' });

      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await adminAPI.getVendors();
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchProduct = async (productId) => {
    try {
      const response = await productAPI.getProductById(productId);
      const product = response.data.data;
      console.log(product)

      setFormData({
        ...product,
        categoryId: product.categoryId?._id || product.categoryId,
        subcategoryId: product.subcategoryId?._id || product.subcategoryId || '',
        tags: product.tags?.join(', ') || '',
        features: product.features?.length > 0 ? product.features : [''],
        // Map specifications array to object for form handling { key: value }
        specifications: Array.isArray(product.specifications)
          ? product.specifications.reduce((acc, spec) => ({ ...acc, [spec.key]: spec.value }), {})
          : product.specifications || {},
        stock: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 5, // Default to 5
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        description: Array.isArray(product.description)
          ? product.description
          : [{ type: 'text', title: '', content: product.description || '', order: 0 }],
      });
      setVendorId(product.vendorId?._id || product.vendorId || '');

      // Initialize specifications fields from populated product data
      const initialCategory = product.subcategoryId?.attributes?.length > 0
        ? product.subcategoryId
        : product.categoryId;

      if (initialCategory && initialCategory.attributes) {
        setSpecFields(initialCategory.attributes);
        setSelectedCategory(initialCategory);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage({ type: 'error', text: 'Failed to load product' });
      setLoading(false);
    }
  };

  const loadCategoryAttributes = (categoryId) => {
    // Search in both categories and subcategories
    const category = categories.find(cat => cat._id === categoryId) ||
      subcategories.find(cat => cat._id === categoryId);

    if (category && category.attributes) {
      setSpecFields(category.attributes);
      setSelectedCategory(category);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';

    if (formData.compareAtPrice && Number(formData.compareAtPrice) <= Number(formData.price)) {
      newErrors.compareAtPrice = 'Compare price must be higher than regular price';
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDescriptionChange = (index, field, value) => {
    const newDescription = [...formData.description];
    newDescription[index] = {
      ...newDescription[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, description: newDescription }));
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const addDescriptionBlock = () => {
    setFormData(prev => ({
      ...prev,
      description: [
        ...prev.description,
        {
          type: 'text',
          title: '',
          content: '',
          order: prev.description.length
        }
      ]
    }));
  };

  const removeDescriptionBlock = (index) => {
    if (formData.description.length > 1) {
      setFormData(prev => ({
        ...prev,
        description: prev.description.filter((_, i) => i !== index)
          .map((desc, i) => ({ ...desc, order: i }))
      }));
    }
  };

  const handleSpecificationChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [fieldName]: value
      }
    }));
  };

  const handleMultiSelectToggle = (fieldName, option) => {
    setFormData(prev => {
      const currentValues = prev.specifications[fieldName] || [];
      const newValues = currentValues.includes(option)
        ? currentValues.filter(v => v !== option)
        : [...currentValues, option];

      return {
        ...prev,
        specifications: {
          ...prev.specifications,
          [fieldName]: newValues
        }
      };
    });
  };

  const handleDimensionChange = (fieldName, dimension, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [fieldName]: {
          ...(prev.specifications[fieldName] || {}),
          [dimension]: value
        }
      }
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
    if (formData.features.length > 1) {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      addNewImages(files);
    }
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    addNewImages(files);
  };

  const addNewImages = (files) => {
    const currentTotal = (formData.images?.length || 0) + newImages.length;

    if (files.length + currentTotal > 5) {
      setMessage({ type: 'error', text: 'Maximum 5 images allowed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await adminAPI.deleteProductImage(id, imageId);

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img._id !== imageId)
      }));

      setMessage({ type: 'success', text: 'Image deleted successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage({ type: 'error', text: 'Failed to delete image' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const uploadToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    uploadData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    uploadData.append('folder', 'apexstore/products');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, uploadData
      );
      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        alt: formData.name
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors before submitting' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

      // Prepare update data
      const mappedSpecifications = (specFields || []).map((field, idx) => {
        const key = field.key;
        if (!key) return null;
        const rawValue = formData.specifications[key];
        const type = (field.type || '').toLowerCase();

        const isEmptyArray = Array.isArray(rawValue) && rawValue.length === 0;
        const isEmptyString = rawValue === '' || rawValue === undefined || rawValue === null;

        if ((isEmptyString || isEmptyArray) && type !== 'boolean') {
          return null;
        }

        return {
          group: field.group || 'General',
          key,
          value: rawValue,
          unit: field.unit || '',
          order: field.order ?? idx
        };
      }).filter(Boolean);

      const cleanedDescription = formData.description
        .filter(desc => desc.content && desc.content.toString().trim() !== '')
        .map((desc, index) => ({
          type: desc.type || 'text',
          title: desc.title || '',
          content: desc.content,
          order: index
        }));

      const updateData = {
        name: formData.name,
        description: cleanedDescription,
        shortDescription: formData.shortDescription,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        specifications: mappedSpecifications,
        stock: Number(formData.stock),
        stockQuantity: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold || 5),
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        origin: formData.origin,
        features: formData.features.filter(f => f.trim() !== ''),
        careInstructions: formData.careInstructions,
        culturalStory: formData.culturalStory,
        videoUrl: formData.videoUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        featured: formData.featured,
        customizable: formData.customizable,
        customizationOptions: formData.customizationOptions,
        images: [...formData.images, ...uploadedImages],
        vendorId: vendorId || undefined
      };

      await adminAPI.updateProduct(productId, updateData);

      setMessage({ type: 'success', text: 'Product updated successfully!' });

      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'vendor') {
          navigate('/vendor/product/list');
        } else if (user.role === 'admin') {
          navigate('/admin/product/list');
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      console.error('Update error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to update product. Please try again.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleAIApply = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev };

      switch (field) {
        case 'shortDescription':
          newData.shortDescription = value;
          break;
        case 'description':
          // value is expected to be an array of sections
          newData.description = value;
          break;
        case 'culturalStory':
          newData.culturalStory = value;
          break;
        case 'careInstructions':
          newData.careInstructions = value;
          break;
        case 'metaTitle':
          newData.metaTitle = value;
          break;
        case 'metaDescription':
          newData.metaDescription = value;
          break;
        default:
          break;
      }

      return newData;
    });

    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate(-1);
    }
  };

  const renderSpecificationField = (field) => {
    const value = formData.specifications[field.key];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {field.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {field.options?.map(option => {
                const isSelected = Array.isArray(value) && value.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleMultiSelectToggle(field.key, option)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-600'
                      }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'dimensions':
        return (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {field.label}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={value?.height || ''}
                  onChange={(e) => handleDimensionChange(field.key, 'height', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={value?.width || ''}
                  onChange={(e) => handleDimensionChange(field.key, 'width', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Depth (cm)</label>
                <input
                  type="number"
                  value={value?.depth || ''}
                  onChange={(e) => handleDimensionChange(field.key, 'depth', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={value?.weight || ''}
                  onChange={(e) => handleDimensionChange(field.key, 'weight', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleSpecificationChange(field.key, e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <label className="text-sm font-semibold text-gray-700">
              {field.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold text-lg">Product Not Found</h3>
              <p>The product you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Package className="text-orange-600" size={40} />
                Edit Product
              </h1>
              <p className="text-gray-600">Update product information and details</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-200 active:scale-95"
            >
              <Sparkles size={20} />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 animate-in slide-in-from-top ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">1</div>
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Premium Gangan Talking Drum"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.name}
                  </p>
                )}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Brief one-line description"
                />
                <p className="mt-1 text-xs text-gray-500">{(formData.shortDescription || '').length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">Add multiple sections to structure your product description</p>

                {formData.description.map((desc, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Section {index + 1}</span>
                        <select
                          value={desc.type}
                          onChange={(e) => handleDescriptionChange(index, 'type', e.target.value)}
                          className="text-sm px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="text">Text</option>
                          <option value="list">List</option>
                        </select>
                      </div>
                      {formData.description.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDescriptionBlock(index)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={desc.title}
                      onChange={(e) => handleDescriptionChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                      placeholder="Section title (optional)"
                    />

                    <textarea
                      value={desc.content}
                      onChange={(e) => handleDescriptionChange(index, 'content', e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder={desc.type === 'list' ? 'Enter list items separated by newlines' : 'Enter description text...'}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDescriptionBlock}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm"
                >
                  <Plus size={16} />
                  Add Section
                </button>

                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">2</div>
              Category
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.categoryId}
                  </p>
                )}
              </div>

              {vendors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign to Vendor
                  </label>
                  <select
                    name="vendorId"
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>{vendor.storeName}</option>
                    ))}
                  </select>
                </div>
              )}

              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subcategory (Optional)
                  </label>
                  <select
                    name="subcategoryId"
                    value={formData.subcategoryId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Specifications */}
          {specFields.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">3</div>
                {selectedCategory?.name} Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specFields.map(field => renderSpecificationField(field))}
              </div>
            </div>
          )}

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">{specFields.length > 0 ? '4' : '3'}</div>
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.price}
                  </p>
                )}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.compareAtPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="0"
                />
                {errors.compareAtPrice && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.compareAtPrice}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Original price (for showing discounts)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock || ''}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.stock}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">{specFields.length > 0 ? '5' : '4'}</div>
              Product Images
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
              {uploading ? (
                <Loader className="animate-spin text-orange-600" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-500">Drag & drop images here, or click to select</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5 images total</p>
                </div>
              )}
            </div>

            {(formData.images?.length > 0 || newImages.length > 0) && (
              <div className="mt-6 flex flex-wrap gap-4">
                {/* Existing Images */}
                {formData.images?.map((img) => (
                  <div key={img._id} className="relative group w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img._id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-md"
                    >
                      <X size={14} />
                    </button>
                    {img.isPrimary && (
                      <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                        Primary
                      </span>
                    )}
                  </div>
                ))}

                {/* New Images */}
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm ring-2 ring-orange-100">
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-md"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute inset-0 bg-orange-500 bg-opacity-10 pointer-events-none" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">{specFields.length > 0 ? '6' : '5'}</div>
              SEO Settings
            </h2>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="SEO Title (max 60 chars)"
                />
                <p className="mt-1 text-xs text-gray-500">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="SEO Description (max 160 chars)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.metaDescription || '').length}/160 characters
                </p>
              </div>
            </div>
          </div>

          {/* Origin & Cultural Story */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">{specFields.length > 0 ? '7' : '6'}</div>
              Origin & Cultural Story
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.origin?.state || ''}
                    onChange={(e) => handleNestedChange('origin', 'state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.origin?.city || ''}
                    onChange={(e) => handleNestedChange('origin', 'city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., Ibadan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Artisan Name
                  </label>
                  <input
                    type="text"
                    value={formData.origin?.artisan || ''}
                    onChange={(e) => handleNestedChange('origin', 'artisan', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., Baba Alagba"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cultural Story
                </label>
                <textarea
                  name="culturalStory"
                  value={formData.culturalStory || ''}
                  onChange={handleInputChange}
                  rows="4"
                  maxLength="2000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Tell the story behind this product..."
                />
                <p className="mt-1 text-xs text-gray-500">{(formData.culturalStory || '').length}/2000 characters</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">{specFields.length > 0 ? '6' : '5'}</div>
              Product Features
            </h2>

            <div className="space-y-3">
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="e.g., Hand-carved wooden body"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    disabled={formData.features.length === 1}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                <Plus size={20} />
                Add Feature
              </button>
            </div>
          </div>



          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">{specFields.length > 0 ? '8' : '7'}</div>
              Additional Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Care Instructions
                </label>
                <textarea
                  name="careInstructions"
                  value={formData.careInstructions || ''}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="How to care for this product..."
                />
                <p className="mt-1 text-xs text-gray-500">{(formData.careInstructions || '').length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video URL (YouTube, Vimeo, etc.)
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.videoUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="https://youtube.com/..."
                />
                {errors.videoUrl && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.videoUrl}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="traditional, handmade, yoruba, gift"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="customizable"
                    checked={formData.customizable || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Customizable</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 sticky bottom-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                <>
                  <CheckCircle size={20} />
                  Update Product
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving || uploading}
              className="px-8 py-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>

        <AIAssistantModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          productName={formData.name}
          categoryName={selectedCategory?.name}
          onApply={handleAIApply}
        />
      </div>
    </div>
  );
};

export default EditProductPage;
