import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../utils/api';

// Async thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartAPI.getCart();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartAPI.addToCart(productId, quantity);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartAPI.updateCartItem(productId, quantity);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartAPI.removeFromCart(productId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartAPI.clearCart();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

export const syncCart = createAsyncThunk(
    'cart/syncCart',
    async (items, { rejectWithValue }) => {
        try {
            const response = await cartAPI.syncCart(items);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
        }
    }
);

// Initial state
const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null,
    synced: false
};

// Cart slice
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Local cart operations (for offline support)
        addItemLocally: (state, action) => {
            const { product, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product._id === product._id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({
                    product,
                    name: product.name,
                    image: product.images[0]?.url || '',
                    price: product.price,
                    quantity,
                    stock: product.stock
                });
            }

            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        removeItemLocally: (state, action) => {
            state.items = state.items.filter(item => item.product._id !== action.payload);
            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        updateItemLocally: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find(item => item.product._id === productId);

            if (item) {
                if (quantity <= 0) {
                    state.items = state.items.filter(item => item.product._id !== productId);
                } else {
                    item.quantity = quantity;
                }
            }

            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalPrice = action.payload.totalPrice || 0;
                state.synced = true;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add to cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalPrice = action.payload.totalPrice || 0;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update cart item
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalPrice = action.payload.totalPrice || 0;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove from cart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalPrice = action.payload.totalPrice || 0;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Clear cart
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.totalItems = 0;
                state.totalPrice = 0;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Sync cart
            .addCase(syncCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(syncCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.totalItems = action.payload.totalItems || 0;
                state.totalPrice = action.payload.totalPrice || 0;
                state.synced = true;
            })
            .addCase(syncCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalPrice;
export const selectCartCount = (state) => state.cart.totalItems;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Actions
export const { addItemLocally, removeItemLocally, updateItemLocally, clearError } = cartSlice.actions;

export default cartSlice.reducer;
