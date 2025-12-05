import Product from "../../models/Product.model.js";

export const adminAddProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            compareAtPrice,
            images,
            drumType,
            materials,
            dimensions,
            woodType,
            skinType,
            tuning,
            sku,
            stock,
            lowStockThreshold,
            collection,
            tags,
            origin,
            features,
            careInstructions,
            videoUrl,
            isActive,
            featured,
            metaTitle,
            metaDescription,
            customizable,
            customizationOptions
        } = req.body;

        // Required fields check
        if (!name || !description || !price || !drumType || !collection) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields: name, description, price, drumType, collection."
            });
        }

        const newProduct = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('collection', 'name slug');
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getAdminProductsBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ 
            slug: req.params.slug,
            isActive: true 
        })

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
        
    }
}


export const updateAdminProduct = async (req, res) => {
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
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

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
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};