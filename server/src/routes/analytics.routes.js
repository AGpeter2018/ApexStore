import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { getVendorAnalytics, getAdminAnalytics } from '../controller/analytics.controller.js';

const router = express.Router();

router.use(protect);

router.get('/vendor', authorize('vendor'), getVendorAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

export default router;
