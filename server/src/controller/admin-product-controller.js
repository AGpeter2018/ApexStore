import Product from "../../models/Product.model.js";
import Category from "../../models/Category.model.js";
import Vendor from "../../models/Vendor.js";

// ============================================
// ADMIN: CREATE PRODUCT (Flexible for All Categories)
// ============================================
export const adminAddProduct = async (req, res) => {
    try {
        const {
            // ===== BASIC INFO (Required for all products) =====
            name,
            description,
            shortDescription,
            price,
            compareAtPrice,
            images,
            
            // ===== CATEGORY SYSTEM (NEW!) =====
            categoryId,
            subcategoryId,
            
            // ===== FLEXIBLE SPECIFICATIONS (NEW!) =====
            // Stores category-specific attributes as JSON
            specifications,
            
            // ===== INVENTORY =====
            sku,
            stock,
            stockQuantity,
            lowStockThreshold,
            
            // ===== VENDOR =====
            vendorId,
            
            // ===== ADDITIONAL INFO =====
            tags,
            origin,
            features,
            careInstructions,
            culturalStory,
            videoUrl,
            
            // ===== STATUS =====
            isActive,
            status,
            featured,
            
            // ===== SEO =====
            metaTitle,
            metaDescription,
            
            // ===== CUSTOMIZATION =====
            customizable,
            customizationOptions,
            
            // ===== LEGACY SUPPORT (Backward Compatibility) =====
            drumType,
            materials,
            dimensions,
            woodType,
            skinType,
            tuning
        } = req.body;

        // ===== VALIDATION =====
        if (!name || !description || !price || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Required fields: name, description, price, categoryId"
            });
        }

        // Validate category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Validate subcategory if provided
        if (subcategoryId) {
            const subcategory = await Category.findById(subcategoryId);
            if (!subcategory || subcategory.parentId === null) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subcategory - must be a child category'
                });
            }
            
            // Ensure subcategory belongs to the selected category
            if (subcategory.parentId.toString() !== categoryId) {
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory does not belong to the selected category'
                });
            }
        }

        // Validate vendor if provided
        if (vendorId) {
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vendor ID'
                });
            }
        }

        // ===== VALIDATE CATEGORY-SPECIFIC ATTRIBUTES =====
        if (category.attributes && category.attributes.length > 0) {
            const missingRequired = [];
            
            for (const attr of category.attributes) {
                if (attr.required) {
                    const value = specifications?.[attr.name];
                    if (!value) {
                        missingRequired.push(attr.label || attr.name);
                    }
                }
            }
            
            if (missingRequired.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required attributes for ${category.name}`,
                    missingFields: missingRequired
                });
            }
        }

        // ===== PREPARE PRODUCT DATA =====
        const productData = {
            name,
            description,
            price,
            categoryId,
            isActive: isActive !== undefined ? isActive : true,
            status: status || 'active'
        };

        // Add optional fields
        if (shortDescription) productData.shortDescription = shortDescription;
        if (compareAtPrice) productData.compareAtPrice = compareAtPrice;
        if (images && images.length > 0) productData.images = images;
        if (subcategoryId) productData.subcategoryId = subcategoryId;
        if (vendorId) productData.vendorId = vendorId;
        if (sku) productData.sku = sku;
        if (lowStockThreshold !== undefined) productData.lowStockThreshold = lowStockThreshold;
        if (tags && tags.length > 0) productData.tags = tags;
        if (origin) productData.origin = origin;
        if (features && features.length > 0) productData.features = features;
        if (careInstructions) productData.careInstructions = careInstructions;
        if (culturalStory) productData.culturalStory = culturalStory;
        if (videoUrl) productData.videoUrl = videoUrl;
        if (featured !== undefined) productData.featured = featured;
        if (metaTitle) productData.metaTitle = metaTitle;
        if (metaDescription) productData.metaDescription = metaDescription;
        if (customizable !== undefined) productData.customizable = customizable;
        if (customizationOptions && customizationOptions.length > 0) {
            productData.customizationOptions = customizationOptions;
        }

        // ===== HANDLE STOCK (Sync both fields) =====
        if (stockQuantity !== undefined) {
            productData.stockQuantity = stockQuantity;
            productData.stock = stockQuantity;
        } else if (stock !== undefined) {
            productData.stock = stock;
            productData.stockQuantity = stock;
        } else {
            productData.stock = 0;
            productData.stockQuantity = 0;
        }

        // ===== FLEXIBLE SPECIFICATIONS (Category-Specific Attributes) =====
        productData.specifications = specifications || {};
        
        // For backward compatibility: If legacy drum fields provided, add to specifications
        if (drumType || materials || dimensions || woodType || skinType || tuning) {
            productData.specifications = {
                ...productData.specifications,
                ...(drumType && { drumType }),
                ...(materials && { materials }),
                ...(dimensions && { dimensions }),
                ...(woodType && { woodType }),
                ...(skinType && { skinType }),
                ...(tuning && { tuning })
            };
            
            // Also save to legacy fields for backward compatibility
            if (drumType) productData.drumType = drumType;
            if (materials) productData.materials = materials;
            if (dimensions) productData.dimensions = dimensions;
            if (woodType) productData.woodType = woodType;
            if (skinType) productData.skinType = skinType;
            if (tuning) productData.tuning = tuning;
        }
        

        // ===== CREATE PRODUCT =====
        const newProduct = await Product.create(productData);

        // Populate references before returning
        await newProduct.populate([
            { path: 'categoryId', select: 'name slug icon attributes' },
            { path: 'subcategoryId', select: 'name slug' },
            { path: 'vendorId', select: 'storeName rating' },
        ]);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });

    } catch (error) {
        console.error('Admin product creation error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `Product with this ${field} already exists`
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: GET ALL PRODUCTS (Advanced Filtering)
// ============================================
export const getAdminProducts = async (req, res) => {
    try {
        const {
            // Category filters
            categoryId,
            subcategoryId,
            
            // Vendor filters
            vendorId,
            
            // Legacy support
            drumType,
            
            // Status filters
            isActive,
            status,
            featured,
            inStock,
            lowStock,
            
            // Price filters
            minPrice,
            maxPrice,
            
            // Search
            search,
            tags,
            
            // Sorting
            sort = '-createdAt',
            
            // Pagination
            page = 1,
            limit = 50
        } = req.query;

        // Build filter object
        const filter = {};

        // Category filtering
        if (categoryId) {
            filter.$or = [
                { categoryId: categoryId },
                { subcategoryId: categoryId }
            ];
        }
        if (subcategoryId) {
            filter.subcategoryId = subcategoryId;
        }

        // Vendor filtering
        if (vendorId) {
            filter.vendorId = vendorId;
        }

        // Legacy filters
        if (drumType) filter.drumType = drumType;

        // Status filters
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        if (status) {
            filter.status = status;
        }
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }

        // Stock filters
        if (inStock === 'true') {
            filter.stockQuantity = { $gt: 0 };
        } else if (inStock === 'false') {
            filter.stockQuantity = 0;
        }
        
        if (lowStock === 'true') {
            filter.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
            filter.stockQuantity = { $gt: 0 };
        }

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Search (multiple fields)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Tags filter
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        // Pagination
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with population
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('categoryId', 'name slug icon')
                .populate('subcategoryId', 'name slug')
                .populate('vendorId', 'storeName rating location')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
                Product.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            filters: {
                categoryId,
                subcategoryId,
                vendorId,
                status,
                inStock,
                lowStock,
                search
            },
            data: products
        });
    } catch (error) {
        console.error('Admin get products error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: GET SINGLE PRODUCT BY SLUG
// ============================================
export const getAdminProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ 
            slug: req.params.slug
        })
        .populate('categoryId', 'name slug icon attributes')
        .populate('subcategoryId', 'name slug')
        .populate('vendorId', 'storeName rating location email phone')

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Admin get product by slug error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: GET SINGLE PRODUCT BY ID
// ============================================
export const getAdminProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'name slug icon attributes')
            .populate('subcategoryId', 'name slug')
            .populate('vendorId', 'storeName rating location email phone')

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Admin get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: UPDATE PRODUCT (Flexible)
// ============================================
export const updateAdminProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate category if being changed
        if (req.body.categoryId && req.body.categoryId !== product.categoryId.toString()) {
            const category = await Category.findById(req.body.categoryId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }
        }

        // Validate subcategory if being changed
        if (req.body.subcategoryId) {
            const subcategory = await Category.findById(req.body.subcategoryId);
            if (!subcategory || subcategory.parentId === null) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subcategory'
                });
            }
        }

        // Validate vendor if being changed
        if (req.body.vendorId && req.body.vendorId !== product.vendorId?.toString()) {
            const vendor = await Vendor.findById(req.body.vendorId);
            if (!vendor) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vendor ID'
                });
            }
        }

        // Sync stock fields
        if (req.body.stockQuantity !== undefined) {
            req.body.stock = req.body.stockQuantity;
        } else if (req.body.stock !== undefined) {
            req.body.stockQuantity = req.body.stock;
        }

        // Update specifications (merge with existing)
        if (req.body.specifications) {
            req.body.specifications = {
                ...product.specifications,
                ...req.body.specifications
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('categoryId', 'name slug icon')
        .populate('subcategoryId', 'name slug')
        .populate('vendorId', 'storeName rating')

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Admin product update error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: DELETE PRODUCT
// ============================================
export const deleteAdminProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: { id: product._id, name: product.name }
        });
    } catch (error) {
        console.error('Admin product deletion error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: BULK UPDATE PRODUCTS
// ============================================
export const bulkUpdateProducts = async (req, res) => {
    try {
        const { productIds, updates } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs array is required'
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates object is required'
            });
        }

        // Sync stock fields if updating
        if (updates.stockQuantity !== undefined) {
            updates.stock = updates.stockQuantity;
        } else if (updates.stock !== undefined) {
            updates.stockQuantity = updates.stock;
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updates },
            { runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} products updated successfully`,
            data: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Admin bulk update error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: GET PRODUCT STATISTICS
// ============================================
export const getProductStats = async (req, res) => {
    try {
        const [
            totalProducts,
            activeProducts,
            inactiveProducts,
            draftProducts,
            featuredProducts,
            outOfStock,
            lowStock
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ status: 'active', isActive: true }),
            Product.countDocuments({ isActive: false }),
            Product.countDocuments({ status: 'draft' }),
            Product.countDocuments({ featured: true }),
            Product.countDocuments({ stockQuantity: 0 }),
            Product.countDocuments({
                $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
                stockQuantity: { $gt: 0 }
            })
        ]);

        // Products by category
        const productsByCategory = await Product.aggregate([
            { $match: { categoryId: { $exists: true } } },
            {
                $group: {
                    _id: '$categoryId',
                    count: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    categoryId: '$_id',
                    categoryName: '$category.name',
                    categorySlug: '$category.slug',
                    count: 1,
                    totalValue: 1
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Products by vendor (top 10)
        const productsByVendor = await Product.aggregate([
            { $match: { vendorId: { $exists: true } } },
            {
                $group: {
                    _id: '$vendorId',
                    count: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            {
                $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    vendorId: '$_id',
                    vendorName: '$vendor.storeName',
                    count: 1,
                    totalValue: 1
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Price statistics
        const priceStats = await Product.aggregate([
            { $match: { isActive: true, stockQuantity: { $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalInventoryValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total: totalProducts,
                    active: activeProducts,
                    inactive: inactiveProducts,
                    draft: draftProducts,
                    featured: featuredProducts,
                    outOfStock,
                    lowStock
                },
                byCategory: productsByCategory,
                byVendor: productsByVendor,
                pricing: priceStats[0] || {
                    avgPrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    totalInventoryValue: 0
                }
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ADMIN: GET CATEGORY ATTRIBUTES (Helper)
// ============================================
export const getCategoryAttributes = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                categoryId: category._id,
                categoryName: category.name,
                attributes: category.attributes || [],
                rules: category.rules || {}
            }
        });
    } catch (error) {
        console.error('Get category attributes error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
    adminAddProduct,
    getAdminProducts,
    getAdminProductBySlug,
    getAdminProductById,
    updateAdminProduct,
    deleteAdminProduct,
    bulkUpdateProducts,
    getProductStats,
    getCategoryAttributes
};