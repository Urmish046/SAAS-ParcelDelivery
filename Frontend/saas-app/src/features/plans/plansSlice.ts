import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
}

interface PlansState {
  plansList: Plan[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PlansState = {
  plansList: [],
  status: 'idle',
  error: null,
};

export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/plans');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.plansList = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default plansSlice.reducer;