// routes/category.routes.js
import express from 'express';
import {
    getCategories,
    getCategoryHierarchy,
    getMainCategories,
    getCategoryBySlug,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories,
    getFeaturedCategories,
    getPopularCategories,
    updateCategoryStats,
    bulkUpdateCategoryStats
} from "../controller/product-category.js"
import { protect, authorize } from '../../middleware/auth.js'; // Your auth middleware

const categoryRouter = express.Router();

// ===== PUBLIC ROUTES =====
categoryRouter.get('/', getCategories); // GET /api/categories
categoryRouter.get('/hierarchy', getCategoryHierarchy); // GET /api/categories/hierarchy
categoryRouter.get('/main', getMainCategories); // GET /api/categories/main
categoryRouter.get('/featured', getFeaturedCategories); // GET /api/categories/featured
categoryRouter.get('/popular', getPopularCategories); // GET /api/categories/popular
categoryRouter.get('/search', searchCategories); // GET /api/categories/search?q=fashion
categoryRouter.get('/slug/:slug', getCategoryBySlug); // GET /api/categories/slug/musical-instruments
categoryRouter.get('/:id', getCategoryById); // GET /api/categories/67abc123...

// ===== ADMIN ROUTES (Protected) =====
categoryRouter.post('/', protect, authorize('admin'), createCategory);
categoryRouter.put('/:id', protect, authorize('admin'), updateCategory);
categoryRouter.delete('/:id', protect, authorize('admin'), deleteCategory);
categoryRouter.put('/:id/stats', protect, authorize('admin'), updateCategoryStats);
categoryRouter.post('/bulk-update-stats', protect, authorize('admin'), bulkUpdateCategoryStats);

export default categoryRouter;