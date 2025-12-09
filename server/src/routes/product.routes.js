
import express from 'express';
import {
    getProducts,
    getProduct,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteImage
} from '../controller/product.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const productRouter = express.Router();
// Public
productRouter.get('/', getProducts);
productRouter.get('/:slug', getProductBySlug);
productRouter.get('/:id', getProduct);
// Admin or Seller
productRouter.post('/', protect, authorize('seller', 'admin'), createProduct);
productRouter.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
productRouter.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);
productRouter.delete('/:slug/image/:imageId', protect, authorize('seller', 'admin'), deleteImage)

export default productRouter;
