import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    location: string;
  };
  createdAt: string;
}

interface StaffState {
  staffList: StaffMember[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StaffState = {
  staffList: [],
  status: 'idle',
  error: null,
};

export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
const staffOnly = response.data.filter((user: any) => user.role === 'warehouse_staff');
      return staffOnly;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff');
    }
  }
);

export const createStaff = createAsyncThunk(
  'staff/createStaff',
  async (staffData: { name: string; email: string; password: string; warehouseId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/staff', {
        ...staffData,
        role: 'warehouse_staff', 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create staff member');
    }
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete staff member');
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearStaffError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.staffList = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.staffList.push(action.payload);
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.staffList = state.staffList.filter(staff => staff.id !== action.payload);
      });
  },
});

export const { clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;