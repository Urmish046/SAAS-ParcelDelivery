import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Parcel {
  id: string;
  internalTrackingId: string;
  originalTrackingNumber: string;
  customerTrackingId?: string;
  description: string;
  weight: number;
  dimensions: string;
  status: string;
  customerId: string;
  originWarehouseId: string;
  destinationWarehouseId: string;
  createdAt: string;
  shippingCost?: number; 
  customer?: { name: string; email: string };
  originWarehouse?: { id: string; name: string }; 
  destinationWarehouse?: { id: string; name: string }; 
  paymentReceiptUrl?: string;
  isCustomerConfirmed?: boolean;
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

export const scanBarcode = createAsyncThunk(
  'parcels/scanBarcode',
  async (trackingNumber: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/parcels/scan', { trackingNumber });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message;
      return rejectWithValue(Array.isArray(msg) ? msg.join(' | ') : (msg || 'Failed to scan parcel'));
    }
  }
);

export const createPreAlert = createAsyncThunk(
  'parcels/createPreAlert',
  async (trackingNumber: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/parcels/pre-alert', { trackingNumber });
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add tracking number');
    }
  }
);

export const updateParcelStatus = createAsyncThunk(
  'parcels/updateStatus',
  async (payloadData: any, { rejectWithValue }) => {
    try {
      const { id, ...dataToUpdate } = payloadData;
      const response = await api.patch(`/parcels/${id}/status`, dataToUpdate);
      
      if (dataToUpdate.status === 'scanned' && response.data.status !== 'scanned') {
         return rejectWithValue("BACKEND BUG: Expected status 'scanned' but got '" + response.data.status + "'");
      }
      return response.data;
    } catch (error: any) {
      const errData = error.response?.data;
      let errorMessage = 'Failed to update parcel status';
      
      if (errData && errData.message) {
        errorMessage = Array.isArray(errData.message) ? errData.message.join(' | ') : errData.message;
      }
      return rejectWithValue(`Backend Error: ${errorMessage}`);
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
      .addCase(scanBarcode.fulfilled, (state, action) => {
        const exists = state.parcelsList.find(p => p.id === action.payload.id);
        if (!exists) {
          state.parcelsList.unshift(action.payload); 
        }
      })
      .addCase(createPreAlert.fulfilled, (state, action) => {
        state.parcelsList.unshift(action.payload);
      })
      .addCase(updateParcelStatus.pending, (state) => {
        state.error = null; 
      })
      .addCase(updateParcelStatus.fulfilled, (state, action) => {
        const updatedList = [...state.parcelsList];
        const index = updatedList.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          updatedList[index] = action.payload;
          state.parcelsList = updatedList;    
        }
      })
      .addCase(updateParcelStatus.rejected, (state, action) => {
        state.error = action.payload as string; 
      })
      .addCase(deleteParcel.fulfilled, (state, action) => {
        state.parcelsList = state.parcelsList.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearParcelsError } = parcelsSlice.actions;
export default parcelsSlice.reducer;