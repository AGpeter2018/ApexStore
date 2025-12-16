import Category from '../../models/Category.model.js'; // Updated model name
import Product from '../../models/Product.model.js';

// ============================================
// GET ALL CATEGORIES
// ============================================
export const getCategories = async (req, res) => {
    try {
        const { 
            featured, 
            isActive = 'true',
            includeSubcategories = 'false', // NEW: Option to include subcategories
            parentId // NEW: Filter by parent (get subcategories only)
        } = req.query;
        
        // Build filter
        const filter = { isActive: isActive === 'true' };
        
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }
        
        // NEW: Filter by parentId
        if (parentId === 'null' || parentId === '') {
            filter.parentId = null; // Get main categories only
        } else if (parentId) {
            filter.parentId = parentId; // Get subcategories of specific parent
        }
        
        let categories = await Category.find(filter)
            .sort({ sortOrder: 1, createdAt: -1 })
            .lean(); // Use lean() for better performance
        
        // NEW: Optionally include subcategories
        if (includeSubcategories === 'true' && !parentId) {
            // Only get subcategories if we're fetching main categories
            categories = await Promise.all(
                categories.map(async (category) => {
                    const subcategories = await Category.find({
                        parentId: category._id,
                        isActive: true
                    })
                    .sort({ sortOrder: 1, name: 1 })
                    .lean();
                    
                    return {
                        ...category,
                        subcategories
                    };
                })
            );
        }
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET CATEGORY HIERARCHY (Main + Subcategories)
// ============================================
export const getCategoryHierarchy = async (req, res) => {
    try {
        const hierarchy = await Category.getHierarchy(); // Uses static method
        
        res.status(200).json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.error('Error fetching hierarchy:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET MAIN CATEGORIES ONLY
// ============================================
export const getMainCategories = async (req, res) => {
    try {
        const mainCategories = await Category.getMainCategories(); // Uses static method
        
        res.status(200).json({
            success: true,
            count: mainCategories.length,
            data: mainCategories
        });
    } catch (error) {
        console.error('Error fetching main categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE CATEGORY BY SLUG WITH PRODUCTS
// ============================================
export const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { 
            page = 1, 
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minPrice,
            maxPrice
        } = req.query;
        
        // Find category
        const category = await Category.findOne({ 
            slug,
            isActive: true 
        }).lean();
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Build product filter
        const productFilter = {
            isActive: true,
            $or: [
                { categoryId: category._id }, // Products directly in this category
                { subcategoryId: category._id } // Products in this subcategory
            ]
        };
        
        // NEW: Price range filter
        if (minPrice || maxPrice) {
            productFilter.price = {};
            if (minPrice) productFilter.price.$gte = Number(minPrice);
            if (maxPrice) productFilter.price.$lte = Number(maxPrice);
        }
        
        // Build sort option
        const sortOption = {};
        sortOption[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        // Get products with pagination
        const skip = (page - 1) * limit;
        
        const [products, totalProducts] = await Promise.all([
            Product.find(productFilter)
                .select('name slug price salePrice images stockQuantity rating numReviews vendorId')
                .populate('vendorId', 'storeName rating')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Product.countDocuments(productFilter)
        ]);
        
        // NEW: Get subcategories if this is a main category
        let subcategories = [];
        if (!category.parentId) {
            subcategories = await Category.find({
                parentId: category._id,
                isActive: true
            })
            .select('name slug categoryImage stats')
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        }
        
        // NEW: Get category path (Main > Sub)
        const categoryDoc = await Category.findById(category._id);
        const path = await categoryDoc.getPath();
        
        res.status(200).json({
            success: true,
            data: {
                category: {
                    ...category,
                    path
                },
                subcategories,
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts,
                    productsPerPage: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching category by slug:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE CATEGORY BY ID
// ============================================
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { includeSubcategories = 'false' } = req.query;
        
        const category = await Category.findById(id).lean();
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Optionally include subcategories
        if (includeSubcategories === 'true') {
            const subcategories = await Category.find({
                parentId: category._id,
                isActive: true
            })
            .sort({ sortOrder: 1, name: 1 })
            .lean();
            
            category.subcategories = subcategories;
        }
        
        // Get category path
        const categoryDoc = await Category.findById(id);
        const path = await categoryDoc.getPath();
        
        res.status(200).json({
            success: true,
            data: {
                ...category,
                path
            }
        });
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// CREATE CATEGORY
// ============================================
export const createCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        
        // NEW: Validate parent exists if parentId provided
        if (categoryData.parentId) {
            const parent = await Category.findById(categoryData.parentId);
            if (!parent) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent category not found'
                });
            }
            
            // NEW: Prevent creating subcategories of subcategories (max 2 levels)
            if (parent.parentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot create subcategory of a subcategory. Maximum 2 levels allowed.'
                });
            }
        }
        
        const category = await Category.create(categoryData);
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        
        // Handle duplicate slug error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists',
                error: 'Duplicate category name'
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// UPDATE CATEGORY
// ============================================
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // NEW: If changing parentId, validate it
        if (updateData.parentId !== undefined) {
            if (updateData.parentId) {
                const parent = await Category.findById(updateData.parentId);
                if (!parent) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parent category not found'
                    });
                }
                
                // Prevent making subcategory of a subcategory
                if (parent.parentId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot make subcategory of a subcategory'
                    });
                }
                
                // Prevent making parent of itself
                if (parent._id.toString() === id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Category cannot be its own parent'
                    });
                }
            }
        }
        
        const category = await Category.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// DELETE CATEGORY
// ============================================
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findById(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // NEW: Check if category can be deleted
        const canDeleteResult = await category.canDelete();
        
        if (!canDeleteResult.canDelete) {
            return res.status(400).json({
                success: false,
                message: canDeleteResult.reason
            });
        }
        
        await Category.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// SEARCH CATEGORIES
// ============================================
export const searchCategories = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const categories = await Category.search(q);
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error searching categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET FEATURED CATEGORIES
// ============================================
export const getFeaturedCategories = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        const categories = await Category.getFeatured(Number(limit));
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching featured categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// GET POPULAR CATEGORIES (by product count)
// ============================================
export const getPopularCategories = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const categories = await Category.getPopular(Number(limit));
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching popular categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// UPDATE CATEGORY STATS (Admin utility)
// ============================================
export const updateCategoryStats = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Count products
        const productCount = await Product.countDocuments({
            $or: [
                { categoryId: id },
                { subcategoryId: id }
            ],
            isActive: true
        });
        
        // Count unique vendors
        const vendors = await Product.distinct('vendorId', {
            $or: [
                { categoryId: id },
                { subcategoryId: id }
            ],
            isActive: true
        });
        
        // Update stats
        category.stats.productCount = productCount;
        category.stats.vendorCount = vendors.length;
        await category.save();
        
        res.status(200).json({
            success: true,
            message: 'Category stats updated',
            data: category
        });
    } catch (error) {
        console.error('Error updating category stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// BULK UPDATE CATEGORY STATS (All categories)
// ============================================
export const bulkUpdateCategoryStats = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        
        let updatedCount = 0;
        
        for (const category of categories) {
            // Count products
            const productCount = await Product.countDocuments({
                $or: [
                    { categoryId: category._id },
                    { subcategoryId: category._id }
                ],
                isActive: true
            });
            
            // Count unique vendors
            const vendors = await Product.distinct('vendorId', {
                $or: [
                    { categoryId: category._id },
                    { subcategoryId: category._id }
                ],
                isActive: true
            });
            
            // Update stats
            category.stats.productCount = productCount;
            category.stats.vendorCount = vendors.length;
            await category.save();
            
            updatedCount++;
        }
        
        res.status(200).json({
            success: true,
            message: `Updated stats for ${updatedCount} categories`,
            updatedCount
        });
    } catch (error) {
        console.error('Error bulk updating category stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
    getCategories,
    getCategoryHierarchy,
    getMainCategories,
    getCategoryBySlug,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories,
    getFeaturedCategories,
    getPopularCategories,
    updateCategoryStats,
    bulkUpdateCategoryStats
};