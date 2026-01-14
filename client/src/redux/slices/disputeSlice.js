import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { disputeAPI } from '../../utils/api';

export const fetchDisputes = createAsyncThunk(
    'dispute/fetchDisputes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await disputeAPI.getDisputes(params);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch disputes');
        }
    }
);

export const fetchDisputeById = createAsyncThunk(
    'dispute/fetchDisputeById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await disputeAPI.getDisputeById(id);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dispute details');
        }
    }
);

export const openDispute = createAsyncThunk(
    'dispute/openDispute',
    async (disputeData, { rejectWithValue }) => {
        try {
            const response = await disputeAPI.openDispute(disputeData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to open dispute');
        }
    }
);

export const respondToDispute = createAsyncThunk(
    'dispute/respondToDispute',
    async ({ id, responseData }, { rejectWithValue }) => {
        try {
            const response = await disputeAPI.respondToDispute(id, responseData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add response');
        }
    }
);

export const resolveDispute = createAsyncThunk(
    'dispute/resolveDispute',
    async ({ id, resolutionData }, { rejectWithValue }) => {
        try {
            const response = await disputeAPI.resolveDispute(id, resolutionData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resolve dispute');
        }
    }
);

const disputeSlice = createSlice({
    name: 'dispute',
    initialState: {
        items: [],
        currentDispute: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        resetDisputeStatus: (state) => {
            state.success = false;
            state.error = null;
        },
        clearCurrentDispute: (state) => {
            state.currentDispute = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchDisputes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDisputes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchDisputes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Single
            .addCase(fetchDisputeById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDisputeById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDispute = action.payload;
            })
            .addCase(fetchDisputeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Open Dispute
            .addCase(openDispute.pending, (state) => {
                state.loading = true;
            })
            .addCase(openDispute.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.items.unshift(action.payload);
            })
            .addCase(openDispute.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Respond
            .addCase(respondToDispute.fulfilled, (state, action) => {
                state.currentDispute = action.payload;
                state.success = true;
            })
            // Resolve
            .addCase(resolveDispute.fulfilled, (state, action) => {
                state.currentDispute = action.payload;
                state.success = true;
                // Update item in list if it looks like what we expect
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    }
});

export const { resetDisputeStatus, clearCurrentDispute } = disputeSlice.actions;
export default disputeSlice.reducer;
