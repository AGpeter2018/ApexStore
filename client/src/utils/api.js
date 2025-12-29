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
    createOrder: (orderData) => api.post('/orders', orderData),
    checkout: (checkoutData) => api.post('/orders/checkout', checkoutData),
    getMyOrders: (params) => api.get('/orders/my-orders', { params }),
    getOrderById: (orderId) => api.get(`/orders/${orderId}`),
    verifyPayment: (orderId, paymentData) => api.post(`/orders/${orderId}/verify-payment`, paymentData)
};

export default api;
