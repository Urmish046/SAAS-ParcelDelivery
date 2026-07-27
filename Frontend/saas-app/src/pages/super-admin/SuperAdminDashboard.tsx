import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
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

  const STATS_DATA = [
    { label: 'Total Companies', value: stats.totalCompanies },
    { label: 'Active Users', value: stats.activeUsers },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions },
    { label: 'Monthly Recurring Revenue', value: `$${stats.totalRevenue.toLocaleString()}` }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Super admin performance and revenue metrics.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-600">System Healthy</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="h-4 w-28 bg-gray-100 rounded mb-4 animate-pulse" />
              <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_DATA.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </h3>
              <p className="text-3xl font-semibold text-gray-900 tabular-nums tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default SuperAdminDashboard;