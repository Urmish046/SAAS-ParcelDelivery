import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const CompanyAdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Warehouses', path: '/dashboard/warehouses' },
    { name: 'Staff', path: '/dashboard/staff' },
    { name: 'Customers', path: '/dashboard/customers' },
    { name: 'Parcels', path: '/dashboard/parcels' },
  ];

  return (
    <div className="flex h-screen bg-brand-50">
      <aside className="w-64 flex flex-col bg-brand-900 text-white">
        <div className="p-6 text-xl font-bold tracking-widest uppercase border-b border-brand-700">
          Admin Portal
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-3 rounded-none transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-700 font-semibold'
                  : 'hover:bg-brand-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-bold tracking-widest text-brand-900 uppercase transition-colors bg-white hover:bg-brand-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm border-brand-200">
          <h1 className="text-xl font-semibold tracking-wide uppercase text-brand-900">
            {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CompanyAdminLayout;