import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, Building2, Users, Package, LogOut, UserCog, Menu, X, DollarSign } from 'lucide-react';import type { RootState } from '../../store/store';

const CompanyAdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const token = localStorage.getItem('token');
  let currentRole = user?.role;
  let currentEmail = user?.email;

  if (!currentRole && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentRole = payload.role;
      currentEmail = payload.email;
    } catch (e) {
      console.error(e);
    }
  }

 const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true, roles: ['company_admin'] },
    { path: '/dashboard/warehouses', icon: Building2, label: 'Warehouses', roles: ['company_admin'] },
    { path: '/dashboard/staff', icon: UserCog, label: 'Staff', roles: ['company_admin'] },
    { path: '/dashboard/customers', icon: Users, label: 'Customers', roles: ['company_admin'] },
    { path: '/dashboard/parcels', icon: Package, label: 'Parcels', roles: ['company_admin', 'warehouse_staff'] },
    { path: '/dashboard/pricing', icon: DollarSign, label: 'Pricing', roles: ['company_admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole || ''));

  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-900 text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between md:justify-center px-4 md:px-0 border-b border-brand-800 shrink-0">
          <h1 className="text-xl font-bold tracking-widest text-brand-100 truncate">
            {currentRole === 'warehouse_staff' ? 'STAFF PORTAL' : 'ADMIN PORTAL'}
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-brand-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-6 py-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-800 text-white border-r-4 border-brand-300'
                    : 'text-brand-300 hover:bg-brand-800/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-800 shrink-0">
          <div className="mb-4 px-2 text-xs text-brand-400 font-medium">
            <span className="text-white truncate block">{currentEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold tracking-wider text-brand-900 transition-colors bg-white rounded-lg hover:bg-brand-100"
          >
            <LogOut className="w-4 h-4 mr-2 shrink-0" />
            LOGOUT
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="md:hidden flex items-center justify-between bg-white border-b border-brand-200 h-16 px-4 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-brand-900 hover:bg-brand-50 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-brand-900 truncate">
              {currentRole === 'warehouse_staff' ? 'STAFF PORTAL' : 'ADMIN PORTAL'}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default CompanyAdminLayout;