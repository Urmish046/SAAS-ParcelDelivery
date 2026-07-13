import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customerLogin } from '../../features/auth/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const companyId = "4695ecc7-0d26-4555-afdc-2792ba6c42e8";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(customerLogin({ email, password, companyId }));
    
    if (customerLogin.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-100">
      <div className="w-full max-w-md p-8 bg-white rounded-none shadow-xl shadow-brand-300/30 border border-brand-300/50">
        <h2 className="mb-6 text-2xl font-bold text-center tracking-wide text-brand-900 uppercase">Customer Portal</h2>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-xs font-semibold tracking-wider text-brand-900 uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-300 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-700 focus:border-brand-700 bg-brand-100/50 text-brand-900 transition-colors"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold tracking-wider text-brand-900 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-300 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-700 focus:border-brand-700 bg-brand-100/50 text-brand-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-3 text-sm font-semibold tracking-widest text-white uppercase transition-colors bg-brand-900 rounded-none hover:bg-brand-500 disabled:opacity-50"
          >
            {status === 'loading' ? 'Processing...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;