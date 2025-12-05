import Product from '../../models/Product.model.js';

// Get all products with filtering
export const getProducts = async (req, res) => {
    try {
        const {
            collection,
            drumType,
            minPrice,
            maxPrice,
            featured,
            isActive = 'true',
            sort = '-createdAt',
            page = 1,
            limit = 12
        } = req.query;
        
        const filter = { isActive: isActive === 'true' };
        
        if (collection) filter.collection = collection;
        if (drumType) filter.drumType = drumType;
        if (featured !== undefined) filter.featured = featured === 'true';
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const products = await Product.find(filter)
            .populate('collection', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);
        
        const total = await Product.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: products
        });
    } catch (error) {
       return res.status(500).json({
        success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Get single product by slug
export const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ 
            slug: req.params.slug,
            isActive: true 
        }).populate('collection', 'name slug');
        
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
       return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Create product
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
       return res.status(500).json({
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
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
      return res.status(500).json({
        success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
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
            message: 'Product deleted successfully'
        });
    } catch (error) {
         return res.status(500).json({
        success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Delete slug images

export const deleteImage = async (req, res) => {
    try {
        const { slug, imageId } = req.params;

        const product = await Product.findOne({ slug });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Remove from array
        product.images = product.images.filter(img => img._id.toString() !== imageId);

        await product.save();

        res.status(200).json({ success: true, message: 'Image deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
