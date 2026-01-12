import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // ===== BASIC INFO =====
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
    description: [
        {
            type: {
                type: String,
                enum: ['text', 'list', 'image', 'table'],
                required: true
            },
            title: String,
            content: mongoose.Schema.Types.Mixed,
            order: Number
        }
    ],

    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },

    // ===== PRICING =====
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    compareAtPrice: { // Now called salePrice for consistency
        type: Number,
        min: [0, 'Compare price cannot be negative']
    },

    // ===== IMAGES =====
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
        },
    }],
    // Reviews
    reviews: [
        {
            user: String,
            comment: String,
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // ===== CATEGORY SYSTEM (NEW!) =====
    // CHANGED: collection → categoryId + subcategoryId
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null // Optional - only if product is in subcategory
    },


    // ===== VENDOR INFO =====
    // CHANGED: seller → vendorId for consistency
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor', // or 'User' if vendors are users
        // required: [true, 'Vendor is required']
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdByRole: {
        type: String,
        enum: ['admin', 'vendor'],
        required: true
    },

    specifications: [
        {
            group: {
                type: String,
                trim: true,
                default: 'General'
            },
            key: {
                type: String,
                required: true,
                trim: true
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            unit: {
                type: String,
                trim: true,
                default: ''
            },
            order: {
                type: Number,
                default: 0
            }
        }
    ],

    // ===== INVENTORY =====
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    // RENAMED: stock → stockQuantity for clarity
    stockQuantity: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },

    // ===== CULTURAL STORYTELLING (YOUR UNIQUE FEATURE!) =====
    culturalStory: {
        type: String,
        maxlength: [2000, 'Cultural story cannot exceed 2000 characters']
    },

    // ===== ORIGIN & CRAFTSMANSHIP =====
    origin: {
        state: {
            type: String,
            default: 'Lagos'
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

    // ===== CATEGORIZATION =====
    tags: [{
        type: String,
        trim: true
    }],

    // ===== PRODUCT FEATURES =====
    features: [{
        type: String,
        trim: true
    }],

    // ===== CARE INSTRUCTIONS =====
    careInstructions: {
        type: String,
        maxlength: [1000, 'Care instructions cannot exceed 1000 characters']
    },

    // ===== MEDIA =====
    videoUrl: {
        type: String,
        trim: true
    },

    // ===== STATUS =====
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'out_of_stock', 'archived'],
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    },

    // ===== RATINGS & REVIEWS =====
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    avgRating: { // More standard naming
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviewCount: { // More standard naming
        type: Number,
        default: 0
    },

    // ===== STATISTICS (NEW!) =====
    viewsCount: {
        type: Number,
        default: 0
    },
    salesCount: {
        type: Number,
        default: 0
    },

    // ===== SEO =====
    metaTitle: {
        type: String,
        maxlength: [500, 'Meta title cannot exceed 200 characters']
    },
    metaDescription: {
        type: String,
        maxlength: [500, 'Meta description cannot exceed 160 characters']
    },

    // ===== CUSTOMIZATION =====
    customizable: {
        type: Boolean,
        default: false
    },
    customizationOptions: [{
        type: String,
        trim: true
    }],
    aiPairingIntents: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ============================================
// MIDDLEWARE / HOOKS
// ============================================

// Generate slug from name before saving
productSchema.pre('save', async function () {
    if (!this.isModified('name')) return;

    let base = this.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    let slug = base;
    let i = 1;

    while (await this.constructor.exists({ slug })) {
        slug = `${base}-${i++}`;
    }

    this.slug = slug;

    // Auto-generate SKU if not provided
    if (!this.sku && this.isNew) {
        // Better SKU format: CAT-VENDOR-TIMESTAMP
        const category = await mongoose.model('Category').findById(this.categoryId);
        const categoryPrefix = category?.name.substring(0, 3).toUpperCase() || 'PRD';
        this.sku = `${categoryPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Sync stock and stockQuantity fields during migration
    if (this.stock !== undefined && this.stockQuantity === 0) {
        this.stockQuantity = this.stock;
    }

    // Update status based on stock
    if (this.stockQuantity === 0) {
        this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.stockQuantity > 0) {
        this.status = 'active';
    }


});

// Update category product count after save
productSchema.post('save', async function (doc) {
    if (doc.categoryId) {
        const Category = mongoose.model('Category');
        const productCount = await mongoose.model('Product').countDocuments({
            $or: [
                { categoryId: doc.categoryId },
                { subcategoryId: doc.categoryId }
            ],
            isActive: true
        });

        await Category.updateOne(
            { _id: doc.categoryId },
            { 'stats.productCount': productCount }
        );
    }
});

// ============================================
// VIRTUALS
// ============================================

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
    }
    return 0;
});

// Virtual for sale price (alternative name)
productSchema.virtual('salePrice').get(function () {
    return this.compareAtPrice && this.compareAtPrice < this.price ? this.compareAtPrice : null;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    const stock = this.stockQuantity || this.stock || 0;
    if (stock === 0) return 'Out of Stock';
    if (stock <= this.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
});

// Virtual for final price (considering sales)
productSchema.virtual('finalPrice').get(function () {
    if (this.compareAtPrice && this.compareAtPrice < this.price) {
        return this.compareAtPrice;
    }
    return this.price;
});

// Virtual for category path (Main > Sub)
productSchema.virtual('categoryPath', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id',
    justOne: true
});

// Virtual for vendor info
productSchema.virtual('vendor', {
    ref: 'Vendor',
    localField: 'vendorId',
    foreignField: '_id',
    justOne: true
});

// ============================================
// INDEXES
// ============================================
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ subcategoryId: 1 });
productSchema.index({ vendorId: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ status: 1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ 'origin.state': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Full-text search

// Compound indexes for common queries
productSchema.index({ categoryId: 1, subcategoryId: 1, isActive: 1 });
productSchema.index({ vendorId: 1, status: 1 });
productSchema.index({ featured: 1, categoryId: 1 });

// ============================================
// INSTANCE METHODS
// ============================================

// Check if product is low stock
productSchema.methods.isLowStock = function () {
    return this.stockQuantity <= this.lowStockThreshold && this.stockQuantity > 0;
};

// Check if product is out of stock
productSchema.methods.isOutOfStock = function () {
    return this.stockQuantity === 0;
};

// Increment view count
productSchema.methods.incrementViews = async function () {
    this.viewsCount += 1;
    await this.save();
};

// Get category-specific attributes
productSchema.methods.getCategoryAttributes = async function () {
    const Category = mongoose.model('Category');
    const category = await Category.findById(this.categoryId);
    return category?.attributes || [];
};

// ============================================
// STATIC METHODS
// ============================================

// Find products by category (including subcategories)
productSchema.statics.findByCategory = function (categoryId) {
    return this.find({
        $or: [
            { categoryId: categoryId },
            { subcategoryId: categoryId }
        ],
        isActive: true
    });
};

// Find featured products
productSchema.statics.findFeatured = function (limit = 10) {
    return this.find({ featured: true, isActive: true })
        .limit(limit)
        .sort({ createdAt: -1 });
};

// Find low stock products (for vendor dashboard)
productSchema.statics.findLowStock = function (vendorId) {
    return this.find({
        vendorId,
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
        stockQuantity: { $gt: 0 }
    });
};

// Search products
productSchema.statics.search = function (query, options = {}) {
    const {
        categoryId,
        minPrice,
        maxPrice,
        inStock = true,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;

    const filter = {
        $text: { $search: query },
        isActive: true
    };

    if (categoryId) {
        filter.$or = [
            { categoryId: categoryId },
            { subcategoryId: categoryId }
        ];
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = minPrice;
        if (maxPrice) filter.price.$lte = maxPrice;
    }

    if (inStock) {
        filter.stockQuantity = { $gt: 0 };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('vendorId', 'storeName rating')
        .populate('categoryId', 'name slug');
};

productSchema.pre('validate', async function () {
    if (!this.categoryId) return;

    const Category = mongoose.model('Category');
    const category = await Category.findById(this.categoryId).lean();

    if (!category?.attributes?.length) return;

    this.specifications ||= [];

    for (const attr of category.attributes) {
        let specEntry = this.specifications.find(
            s => s.key === attr.key
        );

        // AUTO-DEFAULT BOOLEAN (ONLY IF NOT REQUIRED)
        if (attr.type === 'boolean') {
            if (!specEntry && !attr.required) {
                this.specifications.push({
                    key: attr.key,
                    value: false
                });
                specEntry = { value: false };
            } else if (
                specEntry &&
                specEntry.value === undefined &&
                !attr.required
            ) {
                specEntry.value = false;
            }
        }

        // REQUIRED CHECK
        if (attr.required && (!specEntry || specEntry.value === undefined)) {
            throw new Error(`${attr.label || attr.key} is required`);
        }

        if (!specEntry) continue;

        const value = specEntry.value;

        // SELECT / MULTI-SELECT
        if (['select', 'multi-select'].includes(attr.type)) {
            const values = Array.isArray(value) ? value : [value];

            for (const v of values) {
                if (!attr.options?.includes(v)) {
                    throw new Error(
                        `Invalid value for ${attr.label || attr.key}: ${v}`
                    );
                }
            }
        }

        // NUMBER
        if (attr.type === 'number' && typeof value !== 'number') {
            throw new Error(`${attr.label || attr.key} must be a number`);
        }

        // BOOLEAN
        if (attr.type === 'boolean' && typeof value !== 'boolean') {
            throw new Error(`${attr.label || attr.key} must be true or false`);
        }
    }
});



export default mongoose.model('Product', productSchema);

