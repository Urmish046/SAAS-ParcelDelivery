import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // <-- 1. Yeh import kiya
import { adminLogin } from '../../features/auth/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // <-- 2. Navigate hook initialize kiya
  const { status, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Naya state password hide/show toggle karne ke liye
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(adminLogin({ email, password }));
    
    // 3. Agar login successful ho gaya, toh sidha dashboard par bhejo!
    if (adminLogin.fulfilled.match(resultAction)) {
      navigate('/dashboard'); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-100">
      <div className="w-full max-w-md p-8 bg-white rounded-none shadow-xl shadow-brand-300/30 border border-brand-300/50">
        <h2 className="mb-6 text-2xl font-bold text-center tracking-wide text-brand-900 uppercase">Admin Portal</h2>
        
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
            {/* Password input ko relative div mein wrap kiya icon set karne ke liye */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // pr-10 add kiya taake text icon ke neeche na chhupe
                className="w-full px-4 py-3 pr-10 border border-brand-300 rounded-none focus:outline-none focus:ring-1 focus:ring-brand-700 focus:border-brand-700 bg-brand-100/50 text-brand-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-brand-900 transition-colors"
              >
                {showPassword ? (
                  // Eye Open Icon (Hide Password)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Eye Closed Icon (Show Password)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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