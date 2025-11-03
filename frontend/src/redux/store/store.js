// blog-application/frontend/src/redux/store/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';

// Combine all reducers
const store = configureStore({
    reducer: {
        auth: authReducer, // The auth slice manages user state
        // Add other reducers (like postReducer, commentReducer) here later
    },
    // Required to disable serializability check for Next.js/Local Storage integration
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, 
        }),
});

export default store;