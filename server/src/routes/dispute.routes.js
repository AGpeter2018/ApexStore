import express from 'express';
import {
    openDispute,
    getDisputes,
    getDisputeById,
    respondToDispute,
    resolveDispute
} from '../controller/dispute.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Unified route for listing disputes (filtered by role in controller)
router.get('/', getDisputes);

// Customer specific route
router.post('/', authorize('customer'), openDispute);

// Details and responding
router.get('/:id', getDisputeById);
router.post('/:id/respond', respondToDispute);

// Admin specific route for final resolution
router.patch('/:id/resolve', authorize('admin'), resolveDispute);

export default router;
