import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Menu, X } from 'lucide-react';
import type { RootState } from '../../store/store';

const CustomerLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // 🔥 Mobile menu toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/customer/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "block px-4 py-3 text-sm font-bold tracking-wider text-brand-900 uppercase bg-brand-100 border-l-4 border-brand-500 transition-colors"
      : "block px-4 py-3 text-sm font-semibold tracking-wider text-gray-500 uppercase hover:bg-gray-50 hover:text-brand-900 transition-colors";

  return (
    <div className="flex h-screen font-sans bg-gray-100 text-brand-900 overflow-hidden">
      
      {/* 🔥 Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - RESPONSIVE FIX */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 h-16 sm:h-auto">
          <h1 className="text-xl font-extrabold tracking-widest uppercase text-brand-900 truncate">
            My<span className="text-brand-500">Parcels</span>
          </h1>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-brand-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <NavLink 
            to="/customer/dashboard" 
            className={navClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/customer/my-parcels" 
            className={navClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shipment History
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button onClick={handleLogout} className="w-full px-4 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-red-600 hover:bg-red-500">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - RESPONSIVE FIX */}
      <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-white border-b border-gray-200 shadow-sm shrink-0 h-16 sm:h-auto">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-brand-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-lg font-bold tracking-widest uppercase text-brand-900 truncate">
              Customer Portal
            </h2>
          </div>
          
          <div className="text-xs sm:text-sm font-semibold tracking-wider text-gray-500 uppercase truncate max-w-[130px] sm:max-w-none text-right">
            Welcome, <span className="text-brand-500">{(user as any)?.name || 'Customer'}</span>
          </div>
        </header>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;