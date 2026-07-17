import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Parcel {
  id: string;
  internalTrackingId: string;
  customerTrackingId?: string;
  description: string;
  weight: number;
  dimensions: string;
  status: string;
  customerId: string;
  warehouseId: string;
  createdAt: string;
  shippingCost?: number; 
  customer?: { name: string; email: string };
  warehouse?: { name: string };
}

interface ParcelsState {
  parcelsList: Parcel[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ParcelsState = {
  parcelsList: [],
  status: 'idle',
  error: null,
};

export const fetchParcels = createAsyncThunk(
  'parcels/fetchParcels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/parcels');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch parcels');
    }
  }
);

export const createParcel = createAsyncThunk(
  'parcels/createParcel',
  async (parcelData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/parcels', parcelData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create parcel');
    }
  }
);

// Yahan humne naye fields add kiye hain taake typescript error na de
export const updateParcelStatus = createAsyncThunk(
  'parcels/updateStatus',
  async ({ id, status, customerTrackingId, weight, dimensions, shippingCost }: { id: string; status: string; customerTrackingId?: string; weight?: number; dimensions?: string; shippingCost?: number }, { rejectWithValue }) => {
    try {
      const payload: any = { status };
      if (customerTrackingId) payload.customerTrackingId = customerTrackingId;
      if (weight !== undefined) payload.weight = weight;
      if (dimensions !== undefined) payload.dimensions = dimensions;
      if (shippingCost !== undefined) payload.shippingCost = shippingCost;

      const response = await api.patch(`/parcels/${id}/status`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update parcel status');
    }
  }
);

export const deleteParcel = createAsyncThunk(
  'parcels/deleteParcel',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/parcels/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete parcel');
    }
  }
);

const parcelsSlice = createSlice({
  name: 'parcels',
  initialState,
  reducers: {
    clearParcelsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParcels.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchParcels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.parcelsList = action.payload;
      })
      .addCase(fetchParcels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createParcel.fulfilled, (state, action) => {
        state.parcelsList.unshift(action.payload); 
      })
      .addCase(updateParcelStatus.fulfilled, (state, action) => {
        const index = state.parcelsList.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.parcelsList[index] = { ...state.parcelsList[index], ...action.payload };
        }
      })
      .addCase(deleteParcel.fulfilled, (state, action) => {
        state.parcelsList = state.parcelsList.filter(p => p.id !== action.payload);
      })
      .addCase(createParcel.pending, (state) => {
        state.error = null;
      })
      .addCase(createParcel.rejected, (state, action) => {
        state.error = action.payload as string;
      })
  },
});

export const { clearParcelsError } = parcelsSlice.actions;
export default parcelsSlice.reducer;