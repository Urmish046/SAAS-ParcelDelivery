import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  companyId: string;
}

interface WarehousesState {
  warehouses: Warehouse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WarehousesState = {
  warehouses: [],
  status: 'idle',
  error: null,
};

export const fetchWarehouses = createAsyncThunk(
  'warehouses/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/warehouses');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouses/createWarehouse',
  async (warehouseData: { name: string; location: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/warehouses', warehouseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouses/deleteWarehouse',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/warehouses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouses/updateWarehouse',
  async ({ id, data }: { id: string; data: { name: string; location: string } }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/warehouses/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.push(action.payload);
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter(w => w.id !== action.payload);
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })
  },
});

export default warehousesSlice.reducer;