import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { Menu, X } from 'lucide-react';

const SuperAdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔥 Mobile menu toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/super-admin/login');
  };

  return (
    <div className="flex h-screen font-sans bg-brand-100 text-brand-900 overflow-hidden">
      
      {/* 🔥 Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - RESPONSIVE FIX */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 text-white shadow-2xl bg-brand-900 shadow-brand-900/50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-500/30 shrink-0 h-20 sm:h-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase truncate">
              Parcel<span className="text-brand-500">Flow</span>
            </h1>
            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs tracking-widest uppercase text-brand-300 truncate">Super Admin Panel</p>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-brand-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink 
            to="/super-admin/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              isActive 
                ? "block px-4 py-3 text-sm font-bold tracking-wider text-white uppercase transition-colors bg-brand-500 rounded-md" 
                : "block px-4 py-3 text-sm font-semibold tracking-wider uppercase transition-colors text-brand-300 hover:bg-brand-500/50 hover:text-white rounded-md"
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/super-admin/companies" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              isActive 
                ? "block px-4 py-3 text-sm font-bold tracking-wider text-white uppercase transition-colors bg-brand-500 rounded-md" 
                : "block px-4 py-3 text-sm font-semibold tracking-wider uppercase transition-colors text-brand-300 hover:bg-brand-500/50 hover:text-white rounded-md"
            }
          >
            Companies
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-brand-500/30 shrink-0">
          <button 
            onClick={handleLogout} 
            className="w-full px-4 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-red-600/90 hover:bg-red-500 rounded-md"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - RESPONSIVE FIX */}
      <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-5 bg-white border-b shadow-sm border-brand-300 shrink-0 h-16 sm:h-auto">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-brand-900 hover:bg-brand-50 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-lg font-bold tracking-widest uppercase text-brand-900 truncate">
              Control Center
            </h2>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm font-semibold tracking-wider uppercase truncate">
            <span className="text-brand-500 truncate max-w-[120px] sm:max-w-none">System Administrator</span>
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

export default SuperAdminLayout;