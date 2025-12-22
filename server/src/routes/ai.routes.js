import express from 'express';
import { generateProductSuggestions, expandSearchQuery, getAIRecommendations, getVendorAIInsights, handleCustomerChat, getAdminAIInsights } from '../controller/ai.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.post('/suggest-product-content', protect, authorize('vendor', 'admin'), generateProductSuggestions);
router.post('/expand-search-intent', expandSearchQuery);
router.get('/recommendations/:productId', getAIRecommendations);
router.get('/vendor-insights/:vendorId', protect, authorize('vendor', 'admin'), getVendorAIInsights);
router.get('/admin-insights', protect, authorize('admin'), getAdminAIInsights);
router.post('/chat', handleCustomerChat);

export default router;
