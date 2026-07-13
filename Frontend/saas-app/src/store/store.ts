import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import companiesReducer from '../features/companies/companiesSlice'; // Yeh import add karein

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
  },
}); 

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;