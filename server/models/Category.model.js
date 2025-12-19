import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    // ===== BASIC INFO =====
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // ===== HIERARCHICAL SUPPORT (NEW!) =====
    // Allows subcategories: Fashion > Ankara Dresses
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null // null = main category, otherwise = subcategory
    },
    
    // Quick identifier for category level
    level: {
        type: Number,
        default: 1, // 1 = main category, 2 = subcategory
        min: 1,
        max: 2 // Keep it simple: max 2 levels
    },
    
    // ===== VISUAL BRANDING =====
    // Main category banner/hero image
    categoryImage: {
        url: {
            type: String,
            required: [true, 'Category image is required']
        },
        publicId: {
            type: String,
            default: ''
        },
        alt: {
            type: String,
            default: ''
        }
    },
    
    // Icon for category cards (NEW!)
    // Store icon name from lucide-react, material-icons, etc.
    icon: {
        type: String,
        default: 'folder', // Default icon name
        trim: true
    },
    
    // Gallery images (optional - for category showcase pages)
    galleryImages: [{
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
        }
    }],
    
    // Color theme for category (NEW!)
    // Helps with visual differentiation in UI
    colorTheme: {
        primary: {
            type: String,
            default: '#F59E0B', // Amber-500 (ApexStore brand)
            match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ // Valid hex color
        },
        secondary: {
            type: String,
            default: '#10B981', // Emerald-500
            match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        }
    },
    
    // ===== CATEGORY-SPECIFIC ATTRIBUTES (NEW!) =====
    // Different categories have different product attributes
    // Example: Fashion needs "Size", Musical Instruments need "Material"
    attributes: [
  {
    group: {
      type: String,
      default: 'General'
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multi-select', 'boolean'],
      required: true
    },
    options: {
      type: [String],
      default: undefined
    },
    unit: String,
    required: {
      type: Boolean,
      default: false
    }
  }
],

    
    // ===== CATEGORY RULES (NEW!) =====
    // Different categories may have different business rules
    rules: {
        // Minimum/maximum product price for this category
        minPrice: {
            type: Number,
            default: 0
        },
        maxPrice: {
            type: Number,
            default: null // null = no limit
        },
        
        // Whether products in this category require verification
        requiresVerification: {
            type: Boolean,
            default: false
        },
        
        // Commission rate for this category (if different from platform default)
        commissionRate: {
            type: Number,
            min: 0,
            max: 100,
            default: null // null = use platform default (12%)
        },
        
        // Whether shipping is required for this category
        requiresShipping: {
            type: Boolean,
            default: true // Digital products might be false
        }
    },
    
    // ===== SEO & METADATA =====
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    
    // Keywords for better search
    keywords: [{
        type: String,
        trim: true
    }],
    
    // ===== STATUS & DISPLAY =====
    isActive: {
        type: Boolean,
        default: true
    },
    
    featured: {
        type: Boolean,
        default: false
    },
    
    // Display order (lower number = higher priority)
    sortOrder: {
        type: Number,
        default: 0
    },
    
    // ===== STATISTICS (NEW!) =====
    // Track category performance
    stats: {
        productCount: {
            type: Number,
            default: 0
        },
        vendorCount: {
            type: Number,
            default: 0
        },
        totalSales: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ============================================
// VIRTUALS
// ============================================

// Virtual for getting subcategories
categorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId'
});

// Virtual for getting products in this category
categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId'
});

// ============================================
// MIDDLEWARE / HOOKS
// ============================================

// Generate slug from name before saving
categorySchema.pre('save', async function() {
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
    
});

// Set level based on parentId
categorySchema.pre('save', function() {
    if (this.parentId) {
        this.level = 2; // Has parent = subcategory
    } else {
        this.level = 1; // No parent = main category
    }
    
});

// Update product count when category is saved
// categorySchema.post('save', async function(doc) {
//     const Product = mongoose.model('Product');
//     const productCount = await Product.countDocuments({ 
//         categoryId: doc._id,
//         status: 'active'
//     });

//     if (doc.stats.productCount !== productCount) {
//         await mongoose.model('Category').updateOne(
//             { _id: doc._id },
//             { 'stats.productCount': productCount }
//         );
//     }
// });

// ============================================
// INDEXES
// ============================================
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ isActive: 1, featured: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ 'stats.productCount': -1 });
categorySchema.index({ name: 'text', description: 'text', keywords: 'text' });

// ============================================
// INSTANCE METHODS
// ============================================

// Get full category path (Main > Sub)
categorySchema.methods.getPath = async function() {
    if (!this.parentId) {
        return this.name;
    }
    
    const parent = await this.model('Category').findById(this.parentId);
    return parent ? `${parent.name} > ${this.name}` : this.name;
};

categorySchema.path('attributes').validate(function(attrs) {
  for (const attr of attrs) {
    if (
      ['boolean', 'number', 'text'].includes(attr.type) &&
      attr.options?.length
    ) {
      return false;
    }
  }
  return true;
}, 'Options are only allowed for select and multi-select attributes');


// Check if category has subcategories
categorySchema.methods.hasSubcategories = async function() {
    const count = await this.model('Category').countDocuments({ 
        parentId: this._id 
    });
    return count > 0;
};

// Check if category can be deleted
categorySchema.methods.canDelete = async function() {
    // Can't delete if has products
    if (this.stats.productCount > 0) {
        return { 
            canDelete: false, 
            reason: `Cannot delete category with ${this.stats.productCount} products` 
        };
    }
    
    // Can't delete if has subcategories
    const hasSubcats = await this.hasSubcategories();
    if (hasSubcats) {
        return { 
            canDelete: false, 
            reason: 'Cannot delete category with subcategories' 
        };
    }
    
    return { canDelete: true };
};

// ============================================
// STATIC METHODS
// ============================================

// Get main categories only
categorySchema.statics.getMainCategories = function() {
    return this.find({ parentId: null, isActive: true })
        .sort({ sortOrder: 1, name: 1 });
};

// Get featured categories
categorySchema.statics.getFeatured = function(limit = 6) {
    return this.find({ featured: true, isActive: true })
        .sort({ sortOrder: 1 })
        .limit(limit);
};

// Get category hierarchy (with subcategories)
categorySchema.statics.getHierarchy = async function() {
    const mainCategories = await this.find({ parentId: null, isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    
    // Fetch subcategories for each main category
    for (let category of mainCategories) {
        category.subcategories = await this.find({ 
            parentId: category._id, 
            isActive: true 
        })
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    }
    
    return mainCategories;
};

// Search categories
categorySchema.statics.search = function(query) {
    return this.find(
        { $text: { $search: query }, isActive: true },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

// Get popular categories (by product count)
categorySchema.statics.getPopular = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ 'stats.productCount': -1 })
        .limit(limit);
};

// ============================================
// EXPORT
// ============================================
export default mongoose.model('Category', categorySchema);

// ============================================
// EXAMPLE USAGE
// ============================================

/*
// 1. CREATE MAIN CATEGORY (Musical Instruments)
const musicalInstruments = await Category.create({
    name: 'Musical Instruments',
    description: 'Traditional and modern musical instruments',
    icon: 'music',
    categoryImage: {
        url: 'https://cloudinary.com/instruments.jpg',
        alt: 'Musical Instruments'
    },
    attributes: [
        {
            name: 'instrument_type',
            label: 'Instrument Type',
            type: 'select',
            options: ['Drums', 'String', 'Wind', 'Percussion'],
            required: true,
            order: 1
        },
        {
            name: 'material',
            label: 'Material',
            type: 'select',
            options: ['Wood', 'Metal', 'Leather', 'Synthetic'],
            required: true,
            order: 2
        },
        {
            name: 'origin',
            label: 'Origin/Region',
            type: 'text',
            placeholder: 'e.g., Yoruba, Igbo',
            required: false,
            order: 3
        }
    ],
    featured: true,
    sortOrder: 1
});

// 2. CREATE SUBCATEGORY (Talking Drums)
const talkingDrums = await Category.create({
    name: 'Talking Drums',
    description: 'Traditional West African talking drums',
    parentId: musicalInstruments._id, // Link to parent
    icon: 'drum',
    categoryImage: {
        url: 'https://cloudinary.com/talking-drums.jpg',
        alt: 'Talking Drums'
    },
    featured: true,
    sortOrder: 1
});

// 3. CREATE FASHION CATEGORY
const fashion = await Category.create({
    name: 'Fashion & Apparel',
    description: 'Traditional and modern African fashion',
    icon: 'shirt',
    categoryImage: {
        url: 'https://cloudinary.com/fashion.jpg',
        alt: 'Fashion'
    },
    attributes: [
        {
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: ['Men', 'Women', 'Unisex', 'Kids'],
            required: true,
            order: 1
        },
        {
            name: 'size',
            label: 'Size',
            type: 'select',
            options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            required: true,
            order: 2
        },
        {
            name: 'material',
            label: 'Material',
            type: 'select',
            options: ['Cotton', 'Ankara', 'Silk', 'Lace', 'Denim'],
            required: true,
            order: 3
        },
        {
            name: 'color',
            label: 'Color',
            type: 'text',
            required: false,
            order: 4
        }
    ],
    rules: {
        minPrice: 5000,
        requiresShipping: true
    },
    featured: true,
    sortOrder: 2
});

// 4. QUERY EXAMPLES

// Get all main categories
const mainCategories = await Category.getMainCategories();

// Get category with subcategories
const categoryWithSubs = await Category.findById(musicalInstruments._id)
    .populate('subcategories');

// Get category hierarchy
const hierarchy = await Category.getHierarchy();
// Returns: [
//   {
//     name: 'Musical Instruments',
//     subcategories: [
//       { name: 'Talking Drums' },
//       { name: 'Djembe' }
//     ]
//   },
//   {
//     name: 'Fashion & Apparel',
//     subcategories: [...]
//   }
// ]

// Get featured categories
const featured = await Category.getFeatured(6);

// Search categories
const results = await Category.search('fashion ankara');

// Check if can delete
const canDeleteResult = await talkingDrums.canDelete();
if (!canDeleteResult.canDelete) {
    console.log(canDeleteResult.reason);
}

// Get category path
const path = await talkingDrums.getPath();
console.log(path); // "Musical Instruments > Talking Drums"
*/