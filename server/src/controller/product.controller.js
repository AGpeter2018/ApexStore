import Product from '../../models/Product.model.js';
import Category from '../../models/Category.model.js';
import Vendor from '../../models/Vendor.js';

// ============================================
// GET ALL PRODUCTS (with advanced filtering)
// ============================================
export const getProducts = async (req, res) => {
    try {
        const { 
            // Category filters (NEW!)
            categoryId,
            category, // slug or ID
            subcategoryId,
            
            // Legacy support
            drumType,
            
            // General filters
            featured, 
            isActive = 'true',
            inStock,
            minPrice,
            maxPrice,
            vendorId,
            
            // Search
            search,
            tags,
            
            // Sorting & Pagination
            sort = '-createdAt',
            page = 1,
            limit = 12 
        } = req.query;

        // Build filter object
        const filter = { isActive: isActive === 'true' };
        
        // ===== VENDOR FILTERING (CRITICAL) =====
        // If user is a seller/vendor, only show their products
          if (vendorId) {
            // Allow filtering by vendorId for admin or public
            filter.vendorId = vendorId;
        }
        
        // ===== CATEGORY FILTERING (NEW!) =====
        if (categoryId) {
            filter.$or = [
                { categoryId: categoryId },
                { subcategoryId: categoryId }
            ];
        } else if (category) {
            // Support both slug and ID
            const cat = await Category.findOne({
                $or: [
                    { slug: category },
                    { _id: category }
                ]
            });
            
            if (cat) {
                filter.$or = [
                    { categoryId: cat._id },
                    { subcategoryId: cat._id }
                ];
            }
        }
        
        if (subcategoryId) {
            filter.subcategoryId = subcategoryId;
        }
        
        // ===== LEGACY SUPPORT (Backward compatibility) =====
        if (drumType) {
            filter.drumType = drumType;
        }
        
        // ===== GENERAL FILTERS =====
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }
        
        // Stock filtering
        if (inStock === 'true') {
            filter.stockQuantity = { $gt: 0 };
        }
        
        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        // Search by name/description
        if (search) {
            filter.$text = { $search: search };
        }
        
        // Filter by tags
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }
        
        // ===== PAGINATION =====
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // ===== QUERY EXECUTION =====
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('categoryId', 'name slug icon')
                .populate('subcategoryId', 'name slug')
                .populate('vendorId', 'storeName rating') // Updated from seller
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
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE PRODUCT BY ID
// ============================================
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'name slug icon attributes')
            .populate('subcategoryId', 'name slug')
            .populate('vendorId', 'storeName rating location') // Updated
            // .populate('collection', 'name slug'); // Legacy support

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('Product ID:', req.params.id);


        // ===== OWNERSHIP CHECK (for sellers) =====
        if (req.user?.user.role === 'vendor' && req.vendor) {
            const vendorId = product.vendorId?._id;
            if (vendorId.toString() !== req.vendor._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this product'
                });
            }
        }
        
        // Increment view count (optional)
        if (!req.user || req.user.role !== 'vendor') {
            product.viewsCount = (product.viewsCount || 0) + 1;
            await product.save();
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// ============================================
// GET SINGLE PRODUCT BY SLUG
// ============================================
export const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ 
            slug: req.params.slug,
            isActive: true 
        })
        .populate('categoryId', 'name slug icon attributes')
        .populate('subcategoryId', 'name slug')
        .populate('vendorId', 'storeName rating location')
        // .populate('collection', 'name slug'); // Legacy
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Increment view count
        product.viewsCount = (product.viewsCount || 0) + 1;
        await product.save();
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// CREATE PRODUCT
// ============================================
export const createProduct = async (req, res) => {
    try {
    // Only admin or vendor
    if (!['admin', 'vendor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or vendors can create products'
      });
    }

    // Validate category
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Validate subcategory
    if (req.body.subcategoryId) {
      const subcategory = await Category.findById(req.body.subcategoryId);
      if (!subcategory || !subcategory.parentId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subcategory'
        });
      }
    }

    let vendorId = null;

    // If vendor → attach vendor profile
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ owner: req.user._id });
      if (!vendor) {
        return res.status(400).json({
          success: false,
          message: 'Vendor profile not found'
        });
      }
      vendorId = vendor._id;
    }

    // Admin MAY optionally attach a vendor
    if (req.user.role === 'admin' && req.body.vendorId) {
      const vendorExists = await Vendor.findById(req.body.vendorId);
      if (!vendorExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vendorId'
        });
      }
      vendorId = req.body.vendorId;
    }

    const productData = {
      ...req.body,
      vendorId,
      createdBy: req.user._id,
      createdByRole: req.user.role
    };

    // Sync stock
    if (productData.stock !== undefined && !productData.stockQuantity) {
      productData.stockQuantity = productData.stock;
    }

    const product = await Product.create(productData);

    await product.populate([
      { path: 'categoryId', select: 'name slug' },
      { path: 'subcategoryId', select: 'name slug' },
      { path: 'vendorId', select: 'storeName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
    } catch (error) {
        console.error('Error creating product:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product with this name already exists'
            });
        }
        
        res.status(400).json({
            success: false,
            message: 'Failed to create product',
            error: error.message 
        });
    }
};

// ============================================
// UPDATE PRODUCT
// ============================================
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // ===== OWNERSHIP CHECK =====
        const vendorId = product.vendorId;
        if (req.user.role === 'vendor' && vendorId.toString() !== vendor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this product'
            });
        }
        
        // Validate category if being changed
        if (req.body.categoryId && req.body.categoryId !== product.categoryId.toString()) {
            const category = await Category.findById(req.body.categoryId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
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
        
        // Sync stock fields if updating
        if (req.body.stock !== undefined && !req.body.stockQuantity) {
            req.body.stockQuantity = req.body.stock;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('categoryId', 'name slug')
        .populate('subcategoryId', 'name slug')
        .populate('vendorId', 'storeName');

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        
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
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// ============================================
// DELETE PRODUCT
// ============================================
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // ===== OWNERSHIP CHECK =====
        const vendorId = product.vendorId 
        if (req.user.role === 'vendor' && vendorId.toString() !== vendor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this product'
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ============================================
// DELETE PRODUCT IMAGE
// ============================================
export const deleteImage = async (req, res) => {
    try {
        const { slug, imageId } = req.params;

        const product = await Product.findOne({ slug });
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        // Check ownership
        const vendorId = product.vendorId ;
        if (req.user.role === 'vendor' && vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this product'
            });
        }

        // Remove image from array
        product.images = product.images.filter(img => img._id.toString() !== imageId);

        await product.save();

        res.status(200).json({ 
            success: true, 
            message: 'Image deleted successfully',
            data: product
        });

    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message
        });
    }
};

// ============================================
// NEW: GET PRODUCTS BY CATEGORY
// ============================================
export const getProductsByCategory = async (req, res) => {
    try {
        const { categorySlug } = req.params;
        const {
            subcategoryId,
            minPrice,
            maxPrice,
            inStock,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;
        
        // Find category by slug
        const category = await Category.findOne({ slug: categorySlug });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Build filter
        const filter = {
            isActive: true,
            $or: [
                { categoryId: category._id },
                { subcategoryId: category._id }
            ]
        };
        
        if (subcategoryId) {
            filter.subcategoryId = subcategoryId;
        }
        
        if (inStock === 'true') {
            filter.stockQuantity = { $gt: 0 };
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('vendorId', 'storeName rating')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(filter)
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                category: {
                    _id: category._id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    categoryImage: category.categoryImage,
                    galleryImages: category.galleryImages
                },
                products,
                count: products.length,
                total,
                pagination: {
                    page: pageNum,
                    pages: Math.ceil(total / limitNum),
                },
            }
        });
        
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ============================================
// NEW: GET FEATURED PRODUCTS
// ============================================
export const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10, categoryId } = req.query;
        
        const filter = {
            featured: true,
            isActive: true,
            stockQuantity: { $gt: 0 }
        };
        
        if (categoryId) {
            filter.$or = [
                { categoryId: categoryId },
                { subcategoryId: categoryId }
            ];
        }
        
        const products = await Product.find(filter)
            .populate('categoryId', 'name slug')
            .populate('vendorId', 'storeName rating')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
        
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ============================================
// NEW: SEARCH PRODUCTS
// ============================================
export const searchProducts = async (req, res) => {
    try {
        const { q, categoryId, page = 1, limit = 20 } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const filter = {
            $text: { $search: q },
            isActive: true
        };
        
        if (categoryId) {
            filter.$or = [
                { categoryId: categoryId },
                { subcategoryId: categoryId }
            ];
        }
        
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const [products, total] = await Promise.all([
            Product.find(filter, { score: { $meta: 'textScore' } })
                .populate('categoryId', 'name slug')
                .populate('vendorId', 'storeName rating')
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(filter)
        ]);
        
        res.status(200).json({
            success: true,
            query: q,
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: products
        });
        
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ============================================
// NEW: GET VENDOR'S PRODUCTS
// ============================================
export const getVendorProducts = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { page = 1, limit = 20, status } = req.query;
        
        const filter = { vendorId };
        
        if (status) {
            filter.status = status;
        }
        
        // If requester is the vendor, show all; otherwise only active
        if (!req.user || req.user._id.toString() !== vendorId) {
            filter.isActive = true;
        }
        
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('categoryId', 'name slug')
                .populate('subcategoryId', 'name slug')
                .sort({ createdAt: -1 })
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
            data: products
        });
        
    } catch (error) {
        console.error('Error fetching vendor products:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
    getProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteImage,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    getVendorProducts
};