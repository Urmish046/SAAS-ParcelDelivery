import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import companiesReducer from '../features/companies/companiesSlice';
import warehousesReducer from '../features/warehouses/warehousesSlice';
import staffReducer from '../features/staff/staffSlice';
import customersReducer from '../features/customers/customersSlice';
import parcelsReducer from '../features/parcels/parcelsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
    warehouses: warehousesReducer,
    staff: staffReducer,
    customers: customersReducer,
    parcels: parcelsReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;