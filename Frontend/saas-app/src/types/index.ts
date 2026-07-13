export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'china_staff' | 'nigeria_staff' | 'customer';
  companyId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}