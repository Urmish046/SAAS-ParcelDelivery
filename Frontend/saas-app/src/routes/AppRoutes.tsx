import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import SuperAdminLayout from '../components/layout/SuperAdminLayout';
import DashboardOverview from '../pages/admin/DashboardOverview';
import SuperAdminLoginPage from '../pages/auth/SuperAdminLoginPage';
import CompaniesList from '../pages/admin/CompaniesList';

const DummyDashboard = () => (
  <div className="flex items-center justify-center min-h-screen bg-brand-100">
    <div className="p-10 text-2xl font-bold tracking-widest text-center uppercase bg-white border-t-4 shadow-xl text-brand-900 shadow-brand-300/30 border-t-brand-500">
      Customer Dashboard
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
        
        <Route path="/dashboard" element={<DummyDashboard />} />
        
        <Route element={<SuperAdminLayout />}>
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