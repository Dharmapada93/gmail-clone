import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import emailReducer from '../features/emailSlice';
import themeReducer from '../features/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emails: emailReducer,
    theme: themeReducer,
  },
});
