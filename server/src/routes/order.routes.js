import express from 'express';
import {
    getOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
    createOrder,
    getMyOrders
} from '../controller/order.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const orderRouter = express.Router();

// Customer routes
orderRouter.post('/', protect, authorize('customer'), createOrder),
orderRouter.get('/my-orders', protect, authorize('customer'), getMyOrders);

// Admin/Seller routes
orderRouter.get('/', protect, authorize('seller', 'admin'), getOrders);
orderRouter.get('/stats', protect, authorize('seller', 'admin'), getOrderStats);

// Single order (accessible by customer, seller, or admin)
orderRouter.get('/:id',protect, authorize('customer','seller', 'admin'), getOrder);

// Update status (seller/admin only)
orderRouter.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

export default orderRouter;
