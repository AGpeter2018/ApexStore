import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        order: orderReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['cart/fetchCart/fulfilled', 'order/createOrder/fulfilled'],
            },
        }),
});

export default store;
