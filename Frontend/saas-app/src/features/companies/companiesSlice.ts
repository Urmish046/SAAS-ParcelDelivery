import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/company');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/company', companyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create company');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/company/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update company');
    }
  }
);

export const activateCompany = createAsyncThunk(
  'companies/activateCompany',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/company/${id}/activate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate company');
    }
  }
);

export const suspendCompany = createAsyncThunk(
  'companies/suspendCompany',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/company/${id}/suspend`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to suspend company');
    }
  }
);

interface CompanyState {
  companies: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  status: 'idle',
  createStatus: 'idle',
  error: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createCompany.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.companies.push(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.companies[index] = action.payload;
      })
      .addCase(activateCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.companies[index] = action.payload;
      })
      .addCase(suspendCompany.fulfilled, (state, action) => {
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.companies[index] = action.payload;
      });
  },
});

export default companiesSlice.reducer;