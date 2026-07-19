import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Backend ka endpoint yahan update karein agar alag hai
        const { data } = await api.get('/stats/dashboard'); 
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-brand-900 mb-6">System Overview</h1>
      
      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white shadow-md border-l-4 border-brand-500">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Companies</h3>
            <p className="text-3xl font-bold text-brand-900 mt-2">{stats.totalCompanies}</p>
          </div>
          
          <div className="p-6 bg-white shadow-md border-l-4 border-brand-500">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Active Users</h3>
            <p className="text-3xl font-bold text-brand-900 mt-2">{stats.activeUsers}</p>
          </div>
          
          <div className="p-6 bg-white shadow-md border-l-4 border-brand-500">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold text-brand-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;