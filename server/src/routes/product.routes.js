// routes/product.routes.js
import express from 'express';
import {
    getProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteImage,
    // NEW IMPORTS
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    getVendorProducts
} from '../controller/product.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const productRouter = express.Router();

// ============================================
// CRITICAL: Order matters! Specific routes BEFORE dynamic params
// ============================================

// ===== SPECIFIC ROUTES (Must come FIRST) =====
// These must be before /:id and /:slug to avoid conflicts

// Featured products
productRouter.get('/featured', getFeaturedProducts);

// Search products
productRouter.get('/search', searchProducts);


// Get products by category slug
productRouter.get('/category/:categorySlug', getProductsByCategory);

// Get vendor's products
productRouter.get('/vendor/:vendorId', getVendorProducts);

// Get product by slug (MUST come before /:id)
productRouter.get('/slug/:slug', getProductBySlug);

// ===== GENERAL ROUTES =====
// Get all products (with filters)
productRouter.get('/', getProducts);

// ===== DYNAMIC PARAM ROUTES (Must come LAST) =====
// Get single product by ID
productRouter.get('/:id', getProduct);

// ===== PROTECTED ROUTES (Seller/Admin only) =====
// Create product
productRouter.post('/', protect, authorize('vendor', 'admin'), createProduct);

// Update product
productRouter.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);

// Delete product
productRouter.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

// Delete product image
productRouter.delete('/:slug/images/:imageId', protect, authorize('vendor', 'admin'), deleteImage);
// Note: Changed from '/image/' to '/images/' for consistency

export default productRouter;


