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

// Admin/vendor routes
orderRouter.get('/', protect, authorize('vendor', 'admin'), getOrders);
orderRouter.get('/stats', protect, authorize('vendor', 'admin'), getOrderStats);

// Single order (accessible by customer, vendor, or admin)
orderRouter.get('/:id',protect, authorize('customer','vendor', 'admin'), getOrder);

// Update status (vendor/admin only)
orderRouter.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);

export default orderRouter;
