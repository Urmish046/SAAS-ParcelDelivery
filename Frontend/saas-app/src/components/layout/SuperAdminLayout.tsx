import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const SuperAdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen font-sans bg-brand-100 text-brand-900">
      
      {/* Sidebar */}
      <aside className="flex flex-col w-64 text-white shadow-2xl bg-brand-900 shadow-brand-900/50">
        <div className="p-6 border-b border-brand-500/30">
          <h1 className="text-2xl font-extrabold tracking-widest uppercase">
            Parcel<span className="text-brand-500">Flow</span>
          </h1>
          <p className="mt-2 text-xs tracking-widest uppercase text-brand-300">Super Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/super-admin/dashboard" className="block px-4 py-3 text-sm font-bold tracking-wider text-white uppercase transition-colors bg-brand-500">
            Dashboard
          </Link>
          <Link to="/super-admin/companies" className="block px-4 py-3 text-sm font-semibold tracking-wider uppercase transition-colors text-brand-300 hover:bg-brand-500/50 hover:text-white">
            Companies
          </Link>
        </nav>
        
        <div className="p-4 border-t border-brand-500/30">
          <button 
            onClick={handleLogout} 
            className="w-full px-4 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-red-600/90 hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-col flex-1">
        
        {/* Top Navbar */}
        <header className="flex justify-between items-center px-8 py-5 bg-white border-b shadow-sm border-brand-300">
          <h2 className="text-lg font-bold tracking-widest uppercase text-brand-900">
            Control Center
          </h2>
          <div className="flex items-center space-x-4 text-sm font-semibold tracking-wider uppercase">
            <span className="text-brand-500">System Administrator</span>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
};

export default SuperAdminLayout;