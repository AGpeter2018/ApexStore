import express from 'express';
import { adminAddProduct, deleteAdminProduct, getAdminProducts, getAdminProductsBySlug, updateAdminProduct } from '../controller/admin-product-controller.js';

const adminRouter = express.Router();

adminRouter.post('/', adminAddProduct);
adminRouter.get('/', getAdminProducts)
adminRouter.get('/', getAdminProductsBySlug)
adminRouter.put('/:id', updateAdminProduct);
adminRouter.delete('/:id', deleteAdminProduct)

export default adminRouter;
