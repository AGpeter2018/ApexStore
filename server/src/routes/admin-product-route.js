import express from 'express';
import { 
    adminAddProduct, 
    deleteAdminProduct, 
    getAdminProducts, 
    getAdminProductBySlug,
    getAdminProductById,
    updateAdminProduct,
    bulkUpdateProducts,
    getProductStats,
    getCategoryAttributes
} from '../controller/admin-product-controller.js';

const adminRouter = express.Router();

// ============================================
// STATISTICS & ANALYTICS
// ============================================
// Must come before /:id routes to avoid conflicts
adminRouter.get('/stats', getProductStats);

// ============================================
// CATEGORY HELPERS
// ============================================
// Get category-specific attributes (for dynamic form building)
adminRouter.get('/category/:categoryId/attributes', getCategoryAttributes);

// ============================================
// BULK OPERATIONS
// ============================================
// Bulk update multiple products
adminRouter.patch('/bulk', bulkUpdateProducts);

// ============================================
// PRODUCT CRUD
// ============================================
// Get all products with advanced filtering
// Query params: categoryId, subcategoryId, vendorId, status, inStock, lowStock, search, tags, etc.
adminRouter.get('/', getAdminProducts);

// Create new product
adminRouter.post('/', adminAddProduct);

// Get product by slug
// Must come before /:id to avoid slug being treated as ID
adminRouter.get('/slug/:slug', getAdminProductBySlug);

// Get product by ID
adminRouter.get('/:id', getAdminProductById);

// Update product by ID
adminRouter.put('/:id', updateAdminProduct);

// Partial update (PATCH) - same as PUT for now
adminRouter.patch('/:id', updateAdminProduct);

// Delete product by ID
adminRouter.delete('/:id', deleteAdminProduct);

// ============================================
// EXAMPLE ROUTES WITH QUERY PARAMS
// ============================================
/*
GET /api/admin/products - Get all products
GET /api/admin/products?page=1&limit=50 - Paginated products
GET /api/admin/products?categoryId=64abc123 - Products by category
GET /api/admin/products?subcategoryId=64abc456 - Products by subcategory
GET /api/admin/products?vendorId=64abc789 - Products by vendor
GET /api/admin/products?status=active - Products by status (active, draft, archived, out_of_stock)
GET /api/admin/products?featured=true - Featured products only
GET /api/admin/products?inStock=true - In-stock products only
GET /api/admin/products?lowStock=true - Low-stock products only
GET /api/admin/products?search=ankara - Search products
GET /api/admin/products?tags=traditional,fashion - Filter by tags
GET /api/admin/products?minPrice=10000&maxPrice=50000 - Price range
GET /api/admin/products?sort=-price - Sort by price descending
GET /api/admin/products?sort=name - Sort by name ascending

// Combined filters
GET /api/admin/products?categoryId=64abc123&inStock=true&featured=true&sort=-createdAt

// Statistics
GET /api/admin/products/stats - Product statistics dashboard

// Category attributes
GET /api/admin/products/category/64abc123/attributes - Get category-specific attributes

// Get by slug
GET /api/admin/products/slug/ankara-maxi-dress - Get product by slug

// Get by ID
GET /api/admin/products/64abc123 - Get product by ID

// Create product
POST /api/admin/products
{
  "name": "Ankara Maxi Dress",
  "description": "Beautiful traditional dress",
  "price": 15000,
  "categoryId": "64abc123",
  "specifications": {
    "gender": "Women",
    "size": "L",
    "material": "Ankara Cotton"
  },
  "stockQuantity": 20,
  "images": [...]
}

// Update product
PUT /api/admin/products/64abc123
{
  "price": 18000,
  "stockQuantity": 15
}

// Bulk update
PATCH /api/admin/products/bulk
{
  "productIds": ["64abc123", "64abc456", "64abc789"],
  "updates": {
    "featured": true,
    "isActive": true
  }
}

// Delete product
DELETE /api/admin/products/64abc123
*/

export default adminRouter;