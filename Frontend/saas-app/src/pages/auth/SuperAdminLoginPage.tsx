import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin } from '../../features/auth/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const SuperAdminLoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(adminLogin({ email, password }));
    
    if (adminLogin.fulfilled.match(resultAction)) {
      navigate('/super-admin/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-900">
      <div className="w-full max-w-md p-10 bg-white rounded-none shadow-2xl">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1 bg-brand-500"></div>
        </div>
        <h2 className="mb-8 text-2xl font-bold tracking-widest text-center uppercase text-brand-900">
          Super Admin
        </h2>
        
        {error && (
          <div className="p-3 mb-6 text-sm text-white bg-red-600 rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-brand-900">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-300 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-brand-100 text-brand-900"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-brand-900">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-300 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-brand-100 text-brand-900"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-3 mt-4 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-brand-900 rounded-none hover:bg-brand-500 disabled:opacity-50"
          >
            {status === 'loading' ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;