import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../utils/api';

// Async thunks
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderAPI.createOrder(orderData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create order');
        }
    }
);

export const checkout = createAsyncThunk(
    'order/checkout',
    async (checkoutData, { rejectWithValue }) => {
        try {
            const response = await orderAPI.checkout(checkoutData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Checkout failed');
        }
    }
);

export const fetchMyOrders = createAsyncThunk(
    'order/fetchMyOrders',
    async (params, { rejectWithValue }) => {
        try {
            const response = await orderAPI.getMyOrders(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'order/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderAPI.getOrderById(orderId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
        }
    }
);

export const verifyPayment = createAsyncThunk(
    'order/verifyPayment',
    async ({ orderId, paymentData }, { rejectWithValue }) => {
        try {
            const response = await orderAPI.verifyPayment(orderId, paymentData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
        }
    }
);

// Initial state
const initialState = {
    orders: [],
    currentOrder: null,
    checkoutResult: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0
    }
};

// Order slice
const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearCheckoutResult: (state) => {
            state.checkoutResult = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                state.orders.unshift(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Checkout
            .addCase(checkout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutResult = action.payload;
                state.currentOrder = action.payload.order;
                state.orders.unshift(action.payload.order);
            })
            .addCase(checkout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch my orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    pages: action.payload.pages,
                    total: action.payload.total
                };
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify payment
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                // Update order in orders list
                const index = state.orders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Selectors
export const selectOrders = (state) => state.order.orders;
export const selectMyOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectCheckoutResult = (state) => state.order.checkoutResult;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderPagination = (state) => state.order.pagination;

// Actions
export const { clearCurrentOrder, clearCheckoutResult, clearError } = orderSlice.actions;

export default orderSlice.reducer;
