import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import SuperAdminLayout from '../components/layout/SuperAdminLayout';
import DashboardOverview from '../pages/admin/DashboardOverview';
import SuperAdminLoginPage from '../pages/auth/SuperAdminLoginPage';
import CompaniesList from '../pages/admin/CompaniesList';
import CompanyAdminLayout from '../components/layout/CompanyAdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import WarehousesManagement from '../pages/admin/WarehousesManagement';
import StaffManagement from '../pages/admin/StaffManagement';
import CustomersManagement from '../pages/admin/CustomersManagement';
import ParcelsManagement from '../pages/admin/ParcelsManagement';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['company_admin', 'warehouse_staff']} redirectPath="/login">
              <CompanyAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="warehouses" element={<WarehousesManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="customers" element={<CustomersManagement />} />          
          <Route path="parcels" element={<ParcelsManagement />} />
        </Route>
        
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        
        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']} redirectPath="/super-admin/login">
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="companies" element={<CompaniesList />} />
        </Route>
        
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-brand-100">
            <h1 className="p-8 text-2xl font-bold tracking-widest text-center uppercase text-brand-900">404 - Not Found</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;