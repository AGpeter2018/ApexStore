import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart
} from '../controller/cart.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const cartRouter = express.Router();

// All cart routes require authentication as customer
cartRouter.use(protect);
cartRouter.use(authorize('customer'));

// Cart routes
cartRouter.get('/', getCart);
cartRouter.post('/add', addToCart);
cartRouter.post('/sync', syncCart);
cartRouter.put('/update/:productId', updateCartItem);
cartRouter.delete('/remove/:productId', removeFromCart);
cartRouter.delete('/clear', clearCart);

export default cartRouter;
