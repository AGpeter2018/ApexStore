import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = user.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear user data and redirect to login
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
    updateCartItem: (productId, quantity) => api.put(`/cart/update/${productId}`, { quantity }),
    removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
    clearCart: () => api.delete('/cart/clear'),
    syncCart: (items) => api.post('/cart/sync', { items })
};

// Order API
export const orderAPI = {
    getOrders: (params) => api.get('/orders', { params }),
    getOrderStats: () => api.get('/orders/stats'),
    createOrder: (orderData) => api.post('/orders', orderData),
    checkout: (checkoutData) => api.post('/orders/checkout', checkoutData),
    getMyOrders: (params) => api.get('/orders/my-orders', { params }),
    getOrderById: (orderId) => api.get(`/orders/${orderId}`),
    updateOrderStatus: (orderId, statusData) => api.patch(`/orders/${orderId}/status`, statusData),
    verifyPayment: (orderId, paymentData) => api.post(`/orders/${orderId}/verify-payment`, paymentData),
    deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
    getVendorPayments: () => api.get('/orders/vendor/payments'),
    refundOrder: (orderId, refundData) => api.post(`/orders/${orderId}/refund`, refundData),
    cancelOrder: (orderId, data) => api.patch(`/orders/${orderId}/cancel`, data),
};

// User API
export const userAPI = {
    getUserStats: () => api.get('/users/stats'),
    getUsers: (params) => api.get('/users', { params }),
    updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
    updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
    deactivateUser: (userId) => api.put(`/users/${userId}/deactivate`, {}),
    verifyUser: (userId) => api.put(`/users/${userId}/verify`, {}),
};

// Product API (Public)
export const productAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
    getProductById: (productId) => api.get(`/products/${productId}`),
};

// Category API
export const categoryAPI = {
    getCategories: (params) => api.get('/categories', { params }),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Collection API (Experimental/Legacy - may need backend support)
export const collectionAPI = {
    getCollections: () => api.get('/collections'),
};

// Vendor API
export const vendorAPI = {
    getMyVendor: () => api.get('/vendors/me'),
    updateMyVendor: (vendorData) => api.put('/vendors/me', vendorData),
    getVendorProducts: () => api.get('/vendors/me/products'),
    getAllVendors: () => api.get('/vendors'),
    getVendorStats: () => api.get('/vendors/stats'),
    getVendorDetail: (vendorId) => api.get(`/vendors/${vendorId}`),
    updateVendorStatus: (vendorId, statusData) => api.put(`/vendors/${vendorId}/status`, statusData),
    getPayments: () => api.get('/orders/vendor/payments'),
};


// AI API
export const aiAPI = {
    generateProductContent: (data) => api.post('/ai/suggest-product-content', data),
    expandSearchIntent: (data) => api.post('/ai/expand-search-intent', data),
    getRecommendations: (productId) => api.get(`/ai/recommendations/${productId}`),
    getVendorInsights: (vendorId) => api.get(`/ai/vendor-insights/${vendorId}`),
    getAdminInsights: () => api.get('/ai/admin-insights'),
    chat: (chatData) => api.post('/ai/chat', chatData)
};

export const payoutAPI = {
    requestPayout: (data) => api.post('/payouts/request', data),
    getPayouts: () => api.get('/payouts'),
    processPayout: (id, data) => api.patch(`/payouts/${id}/process`, data),
};

export const analyticsAPI = {
    getVendorAnalytics: () => api.get('/analytics/vendor'),
    getAdminAnalytics: () => api.get('/analytics/admin'),
};

export const adminAPI = {
    getProducts: (params) => api.get('/admin/products', { params }),
    getProductStats: () => api.get('/admin/products/stats'),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
    updateProduct: (id, data) => api.put(`/products/${id}`, data), // Note: some products use /products/:id for update
    deleteProductImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
};

// Dispute API
export const disputeAPI = {
    getDisputes: (params) => api.get('/disputes', { params }),
    getDisputeById: (id) => api.get(`/disputes/${id}`),
    openDispute: (data) => api.post('/disputes', data),
    respondToDispute: (id, data) => api.post(`/disputes/${id}/respond`, data),
    resolveDispute: (id, data) => api.patch(`/disputes/${id}/resolve`, data),
};

export default api;
