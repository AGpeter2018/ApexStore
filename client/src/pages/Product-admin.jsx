import { useState, useEffect } from 'react';
import { Upload, X, Plus, Loader, AlertCircle, CheckCircle, Package, Trash2 } from 'lucide-react';
import axios from 'axios';

const AddProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: [{ type: 'text', title: '', content: '', order: 0 }],
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    categoryId: '',
    subcategoryId: '',
    specifications: {},
    stock: '',
    origin: {
      state: 'Lagos',
      city: '',
      artisan: ''
    },
    features: [''],
    careInstructions: '',
    culturalStory: '',
    videoUrl: '',
    tags: '',
    featured: false,
    customizable: false,
    customizationOptions: []
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [specFields, setSpecFields] = useState([]);

  // Configure axios defaults
  const API_URL = import.meta.env.VITE_API_URL;
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch initial data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      fetchVendors();
    }
    fetchCategories();
  }, []);

  // Load category attributes when category changes
  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategories(formData.categoryId);
      loadCategoryAttributes(formData.categoryId);
    } else {
      setSpecFields([]);
      setSelectedCategory(null);
      setSubcategories([]);
      setFormData(prev => ({ ...prev, specifications: {}, subcategoryId: '' }));
    }
  }, [formData.categoryId, categories]);

  const fetchVendors = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/vendors`, {
        headers: getAuthHeaders()
      });
      setVendors(data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`, {
        params: { parentId: 'null', isActive: true }
      });
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`, {
        params: { parentId: categoryId, isActive: true }
      });
      setSubcategories(data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const loadCategoryAttributes = (categoryId) => {
    const category = categories.find(cat => String(cat._id) === String(categoryId));
    if (category && category.attributes && category.attributes.length > 0) {
      setSpecFields(category.attributes);
      setSelectedCategory(category);
      
      // Initialize specifications based on attribute types
      const specs = {};
      category.attributes.forEach(attr => {
        const key = attr.key;
        if (!key) return;
        const type = (attr.type || 'text').toLowerCase();
        
        if (type === 'multi-select') {
          specs[key] = [];
        } else if (type === 'number') {
          specs[key] = '';
        } else if (type === 'boolean') {
          specs[key] = false;
        } else {
          specs[key] = '';
        }
      });
      setFormData(prev => ({ ...prev, specifications: specs }));
    } else {
      setSpecFields([]);
      setFormData(prev => ({ ...prev, specifications: {} }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    
    const hasValidDescription = formData.description.some(desc => 
      desc.content && desc.content.toString().trim() !== ''
    );
    if (!hasValidDescription) newErrors.description = 'At least one description block with content is required';
    
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';

    if (formData.compareAtPrice && Number(formData.compareAtPrice) <= Number(formData.price)) {
      newErrors.compareAtPrice = 'Compare price must be higher than regular price';
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL';
    }

    // Validate required specifications
    specFields.forEach(field => {
      if (field.required) {
        const value = formData.specifications[field.key];
        const isEmpty = value === '' || value === null || value === undefined || 
                       (Array.isArray(value) && value.length === 0);
        if (isEmpty) {
          newErrors[`spec_${field.key}`] = `${field.label || field.group || field.key} is required`;
        }
      }
    });

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
    if (errors[`spec_${fieldName}`]) {
      setErrors(prev => ({ ...prev, [`spec_${fieldName}`]: '' }));
    }
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
    if (errors[`spec_${fieldName}`]) {
      setErrors(prev => ({ ...prev, [`spec_${fieldName}`]: '' }));
    }
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
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
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
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) addImages(files);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const addImages = (files) => {
    if (files.length + images.length > 5) {
      setMessage({ type: 'error', text: 'Maximum 5 images allowed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setImages(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, images: '' }));

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    uploadData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    uploadData.append('folder', 'apexstore/products');

    try {
      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        uploadData
      );
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
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

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload images to Cloudinary
      setUploading(true);
      const uploadedImages = [];

      for (let i = 0; i < images.length; i++) {
        const imageData = await uploadToCloudinary(images[i]);
        uploadedImages.push({
          ...imageData,
          isPrimary: i === 0
        });
      }
      setUploading(false);

      // Map specifications from UI object to model array format
      const mappedSpecifications = (specFields || []).map((field, idx) => {
        const key = field.key;
        if (!key) return null;
        const rawValue = formData.specifications[key];
        const type = (field.type || '').toLowerCase();

        // Skip empty values except booleans
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

      // Clean description array - remove empty blocks
      const cleanedDescription = formData.description
        .filter(desc => desc.content && desc.content.toString().trim() !== '')
        .map((desc, index) => ({
          type: desc.type || 'text',
          title: desc.title || '',
          content: desc.content,
          order: index
        }));

      // Prepare product data matching your Product model
      const productData = {
        name: formData.name.trim(),
        description: cleanedDescription,
        shortDescription: formData.shortDescription.trim(),
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || null,
        specifications: mappedSpecifications,
        stock: Number(formData.stock),
        stockQuantity: Number(formData.stock),
        origin: {
          state: formData.origin.state.trim(),
          city: formData.origin.city.trim(),
          artisan: formData.origin.artisan.trim()
        },
        features: formData.features.filter(f => f.trim() !== ''),
        careInstructions: formData.careInstructions.trim(),
        culturalStory: formData.culturalStory.trim(),
        videoUrl: formData.videoUrl.trim(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        featured: formData.featured,
        customizable: formData.customizable,
        customizationOptions: formData.customizationOptions || [],
        images: uploadedImages
      };

      // Add vendorId if admin is assigning to vendor
      if (vendorId) {
        productData.vendorId = vendorId;
      }

      console.log('Product data to submit:', productData);

      // Submit to API using axios
      const { data } = await axios.post(`${API_URL}/products`, productData, {
        headers: getAuthHeaders()
      });

      console.log('Product created:', data);
      setMessage({ type: 'success', text: 'Product created successfully!' });

      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        window.location.href = `/${user.role || 'vendor'}`;
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      setMessage({
        type: 'error',
        text: errorMessage
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      window.location.href = `/${user.role || 'vendor'}`;
    }
  };

  const renderSpecificationField = (field) => {
    const key = field.key;
    const value = formData.specifications[key];
    const type = (field.type || 'text').toLowerCase();
    const error = errors[`spec_${key}`];
    const label = field.label || field.group || key;

    switch (type) {
      case 'text':
        return (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {label} {field.required && <span className="text-red-500">*</span>}
              {field.unit && <span className="text-gray-500 text-xs ml-1">({field.unit})</span>}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleSpecificationChange(key, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder={`Enter ${label}`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {label} {field.required && <span className="text-red-500">*</span>}
              {field.unit && <span className="text-gray-500 text-xs ml-1">({field.unit})</span>}
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleSpecificationChange(key, e.target.value ? Number(e.target.value) : '')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
              placeholder="0"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleSpecificationChange(key, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select {label}</option>
              {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>
        );

      case 'multi-select':
        return (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {(field.options || []).map(option => {
                const isSelected = Array.isArray(value) && value.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleMultiSelectToggle(key, option)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleSpecificationChange(key, e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded"
            />
            <label className="text-sm font-semibold text-gray-700">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {error && (
              <p className="ml-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Package className="text-orange-600" size={40} />
            Add New Product
          </h1>
          <p className="text-gray-600">Create a product listing for your store</p>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
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
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  maxLength="200"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief one-line description"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.shortDescription.length}/200 characters</p>
              </div>

              {/* Description Blocks */}
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={formData.subcategoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          {specFields.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">3</div>
                Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specFields.map(field => renderSpecificationField(field))}
              </div>
            </div>
          )}

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">4</div>
              Product Images
            </h2>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${
                dragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
              {uploading ? (
                <Loader className="animate-spin text-orange-600" />
              ) : (
                <p className="text-gray-500">Drag & drop images here, or click to select (max 5)</p>
              )}
            </div>

            {errors.images && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.images}
              </p>
            )}

            {imagePreviews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features & Other Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">5</div>
              Additional Details
            </h2>

            {/* Features */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Features
              </label>
              {formData.features.map((feat, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder={`Feature ${index + 1}`}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center gap-1"
              >
                <Plus size={14} /> Add Feature
              </button>
            </div>

            {/* Care Instructions */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Care Instructions</label>
              <textarea
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Cultural Story */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cultural Story</label>
              <textarea
                name="culturalStory"
                value={formData.culturalStory}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Video URL */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                  errors.videoUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="https://"
              />
            </div>

            {/* Featured & Customizable */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label className="text-sm font-semibold text-gray-700">Featured Product</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="customizable"
                  checked={formData.customizable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label className="text-sm font-semibold text-gray-700">Customizable</label>
              </div>
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className={`px-6 py-3 rounded-lg text-white font-semibold ${
                loading || uploading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
