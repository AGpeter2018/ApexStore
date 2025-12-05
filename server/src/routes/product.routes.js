
import express from 'express';
import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteImage
} from '../controller/product.controller.js';

const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.get('/:slug', getProductBySlug);
productRouter.post('/', createProduct);
productRouter.put('/:id', updateProduct);
productRouter.delete('/:id', deleteProduct);
productRouter.delete('/:slug/image/:imageId', deleteImage)

export default productRouter;
