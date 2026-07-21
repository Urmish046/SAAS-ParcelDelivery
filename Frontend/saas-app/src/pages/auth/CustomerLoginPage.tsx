import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { customerLogin } from '../../features/auth/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const CustomerLoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(customerLogin({ email, password }));
    
    if (customerLogin.fulfilled.match(resultAction)) {
      navigate('/customer/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans text-brand-900">
      <div className="w-full max-w-md p-8 bg-white border-t-4 shadow-xl shadow-gray-200/50 border-brand-500">
        <h2 className="mb-2 text-2xl font-extrabold text-center tracking-widest uppercase">Customer Portal</h2>
        <p className="mb-8 text-sm text-center text-gray-500 font-semibold tracking-wider uppercase">Track & Manage Your Shipments</p>

        {error && (
          <div className="p-3 mb-6 text-sm font-bold text-white bg-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-gray-600">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 bg-gray-50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 bg-gray-50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-4 mt-4 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-brand-900 hover:bg-brand-500 disabled:opacity-50"
          >
            {status === 'loading' ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerLoginPage;