import Wishlist from '../../models/Wishlist.model.js';
import Product from '../../models/Product.model.js';

// Get user wishlist
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
            path: 'products',
            populate: {
                path: 'vendorId',
                select: 'storeName'
            }
        });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
};

// Toggle product in wishlist
export const toggleWishlist = async (req, res) => {
    const { productId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
        } else {
            // Use Mongoose pull/addToSet for cleaner ObjectId handling
            const productIdStr = productId.toString();
            const exists = wishlist.products.some(id => id.toString() === productIdStr);

            if (exists) {
                wishlist.products.pull(productId);
            } else {
                wishlist.products.addToSet(productId);
            }
            await wishlist.save();
        }

        // Re-populate for frontend consistency
        await wishlist.populate({
            path: 'products',
            populate: {
                path: 'vendorId',
                select: 'storeName'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Wishlist updated',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating wishlist',
            error: error.message
        });
    }
};

export default {
    getWishlist,
    toggleWishlist
};
