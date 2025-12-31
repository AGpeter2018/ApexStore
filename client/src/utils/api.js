import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
// Broadway

// AI API
export const aiAPI = {
    generateProductContent: (data) => api.post('/ai/suggest-product-content', data),
    expandSearchIntent: (data) => api.post('/ai/expand-search-intent', data),
    getRecommendations: (productId) => api.get(`/ai/recommendations/${productId}`),
    getVendorInsights: (vendorId) => api.get(`/ai/vendor-insights/${vendorId}`),
    getAdminInsights: () => api.get('/ai/admin-insights'),
    chat: (chatData) => api.post('/ai/chat', chatData)
};

export default api;
