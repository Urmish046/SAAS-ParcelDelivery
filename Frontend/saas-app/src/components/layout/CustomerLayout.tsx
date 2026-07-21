import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import type { RootState } from '../../store/store';

const CustomerLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/customer/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "block px-4 py-3 text-sm font-bold tracking-wider text-brand-900 uppercase bg-brand-100 border-l-4 border-brand-500 transition-colors"
      : "block px-4 py-3 text-sm font-semibold tracking-wider text-gray-500 uppercase hover:bg-gray-50 hover:text-brand-900 transition-colors";

  return (
    <div className="flex min-h-screen font-sans bg-gray-100 text-brand-900">
      
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-extrabold tracking-widest uppercase text-brand-900">
            My<span className="text-brand-500">Parcels</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-4 space-y-1">
          <NavLink to="/customer/dashboard" className={navClass}>Dashboard</NavLink>
          <NavLink to="/customer/my-parcels" className={navClass}>Shipment History</NavLink>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full px-4 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-red-600 hover:bg-red-500">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold tracking-widest uppercase text-brand-900">Customer Portal</h2>
          <div className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
Welcome, <span className="text-brand-500">{(user as any)?.name || 'Customer'}</span>          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;