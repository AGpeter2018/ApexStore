import Collection from '../../models/product-collections.model.js';
import Product from '../../models/Product.model.js';

// Get all collections
export const getCollections = async (req, res) => {
    try {
        const { featured, isActive = 'true' } = req.query;
        
        const filter = { isActive: isActive === 'true' };
        if (featured !== undefined) filter.featured = featured === 'true';
        
        const collections = await Collection.find(filter).sort({ sortOrder: 1, createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: collections.length,
            data: collections
        });
    } catch (error) {
      return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Get single collection by slug with its products
export const getCollectionBySlug = async (req, res) => {
    try {
        const collection = await Collection.findOne({ 
            slug: req.params.slug,
            isActive: true 
        });
        
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }
        
        // Get products in this collection
        const products = await Product.find({ 
            collection: collection._id,
            isActive: true 
        }).select('name slug price compareAtPrice images drumType stock rating numReviews');
        
        res.status(200).json({
            success: true,
            data: {
                collection,
                products,
                productCount: products.length
            }
        });
    } catch (error) {
      return res.status(500).json({
            success: false, 
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

export const getCollectionById = async (req, res) => {

    try {
        const { id } = req.params
        const collection = await Collection.findById(id)
        if(!collection) {
           return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
        }

        res.status(200).json({
            success: true,
            data: collection 
        })
        
    } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }

}

// Create collection
export const createCollection = async (req, res) => {
    try {
        const collection = await Collection.create(req.body);
        
        res.status(201).json({
            success: true,
            data: collection
        });
    } catch (error) {
      return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Update collection
export const updateCollection = async (req, res) => {
    try {
        const collection = await Collection.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found',
            });
        }
        
        res.status(200).json({
            success: true,
            data: collection
        });
    } catch (error) {
       return res.status(500).json({
        success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};

// Delete collection
export const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findByIdAndDelete(req.params.id);
        
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Collection deleted successfully'
        });
    } catch (error) {
       return res.status(500).json({
        success: false,
            message: 'Internal server error',
            error: error.message  // ✅ Show the actual error
        })
    }
};