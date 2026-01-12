import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/wishlist');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching wishlist');
        }
    }
);

export const toggleWishlist = createAsyncThunk(
    'wishlist/toggleWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await api.post('/wishlist/toggle', { productId });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error updating wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [], // Array of product objects
        loading: false,
        error: null,
    },
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.products || [];
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle Wishlist
            .addCase(toggleWishlist.pending, (state) => {
                // Optionally handle optimistic update or loading state
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                state.loading = false;
                // Update items with the populated products returned from backend
                state.items = action.payload.products || [];
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
