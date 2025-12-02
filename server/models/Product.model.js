import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    // Short description for cards/listings
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    
    // Pricing
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
        type: Number,
        min: [0, 'Compare price cannot be negative']
    },
    
    // Main product images
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            default: ''
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    
    // Drum-specific details
    drumType: {
        type: String,
        enum: ['Talking Drum (Gangan)', 'Bata Drum', 'Dundun', 'Sakara', 'Agogo', 'Bembe', 'Other'],
        required: [true, 'Drum type is required']
    },
    
    // Materials used
    materials: [{
        type: String,
        enum: ['Cowhide', 'Goatskin', 'Wood', 'Leather Straps', 'Metal Rings', 'Rope', 'Other']
    }],
    
    // Dimensions
    dimensions: {
        height: {
            type: Number, // in centimeters
            min: [0, 'Height cannot be negative']
        },
        diameter: {
            type: Number, // in centimeters
            min: [0, 'Diameter cannot be negative']
        },
        weight: {
            type: Number, // in kilograms
            min: [0, 'Weight cannot be negative']
        }
    },
    
    // Product details
    woodType: {
        type: String,
        trim: true
    },
    skinType: {
        type: String,
        enum: ['Cowhide', 'Goatskin', 'Mixed'],
        default: 'Cowhide'
    },
    tuning: {
        type: String,
        enum: ['Pre-tuned', 'Adjustable', 'Fixed'],
        default: 'Adjustable'
    },
    
    // Inventory
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    
    // Collection reference
    collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: [true, 'Collection is required']
    },
    
    // Additional categorization
    tags: [{
        type: String,
        trim: true
    }],
    
    // Origin and craftsmanship
    origin: {
        state: {
            type: String,
            default: 'Oyo' // Default to Oyo state
        },
        city: {
            type: String,
            trim: true
        },
        artisan: {
            type: String,
            trim: true
        }
    },
    
    // Product features
    features: [{
        type: String,
        trim: true
    }],
    
    // Care instructions
    careInstructions: {
        type: String,
        maxlength: [1000, 'Care instructions cannot exceed 1000 characters']
    },
    
    // Video URL (for demonstrations)
    videoUrl: {
        type: String,
        trim: true
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    
    // Ratings and reviews
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
        type: Number,
        default: 0
    },
    
    // SEO
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    
    // Customization options
    customizable: {
        type: Boolean,
        default: false
    },
    customizationOptions: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Generate slug from name before saving
productSchema.pre('save', async function() {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    
    // Auto-generate SKU if not provided
    if (!this.sku && this.isNew) {
        this.sku = `DRUM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    

});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
    }
    return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= this.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
});

// Indexes for better performance
productSchema.index({ slug: 1 });
productSchema.index({ collection: 1, isActive: 1 });
productSchema.index({ drumType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ 'origin.state': 1 });

export default mongoose.model('Product', productSchema);
