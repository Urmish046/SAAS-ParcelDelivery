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

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
    <div className="p-10 text-xl font-bold tracking-widest text-center uppercase bg-white border-t-4 shadow-xl text-brand-900 shadow-brand-300/30 border-t-brand-500">
      {title}
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<SuperAdminLoginPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <CompanyAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PlaceholderPage title="Company Dashboard Overview" />} />
          <Route path="warehouses" element={<WarehousesManagement />} />
          <Route path="staff" element={<PlaceholderPage title="Staff Management" />} />
          <Route path="customers" element={<PlaceholderPage title="Customers Management" />} />
          <Route path="parcels" element={<PlaceholderPage title="Parcels Management" />} />
        </Route>
        
        <Route 
          element={
            <ProtectedRoute>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/super-admin/dashboard" element={<DashboardOverview />} />
          <Route path="/super-admin/companies" element={<CompaniesList />} />
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