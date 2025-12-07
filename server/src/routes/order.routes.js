import express from 'express';
import {
    getOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
    createOrder
} from '../controller/order.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const orderRouter = express.Router();
orderRouter.post('/', protect, authorize('customer', 'admin'), createOrder)
orderRouter.get('/', protect, authorize('seller', 'admin'), getOrders);
orderRouter.get('/stats', protect, authorize('seller', 'admin'), getOrderStats);
orderRouter.get('/:id', protect, authorize('seller', 'admin'), getOrder);
orderRouter.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

export default orderRouter;
