import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import disputeReducer from './slices/disputeSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        wishlist: wishlistReducer,
        order: orderReducer,
        dispute: disputeReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: [
                    'cart/fetchCart/fulfilled',
                    'order/createOrder/fulfilled',
                    'wishlist/fetchWishlist/fulfilled'
                ],
            },
        }),
});

export default store;
