import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '../../features/companies/companiesSlice';
import type { AppDispatch, RootState } from '../../store/store';

const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, status } = useSelector((state: RootState) => state.companies);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCompanies());
    }
  }, [status, dispatch]);

  const totalCompanies = companies?.length || 0;
  const activeCompanies = companies?.filter((c: any) => c.status?.toLowerCase() === 'active').length || 0;
  const suspendedCompanies = companies?.filter((c: any) => c.status?.toLowerCase() === 'suspended').length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-brand-900">
          Platform Overview
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        
        <div className="p-5 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 truncate">Total Companies</p>
          </div>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-semibold text-brand-900">
              {status === 'loading' ? '...' : totalCompanies}
            </p>
            <span className="ml-2 text-sm font-medium text-gray-500">Registered</span>
          </div>
        </div>

        <div className="p-5 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 truncate">Active Companies</p>
          </div>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-semibold text-brand-900">
              {status === 'loading' ? '...' : activeCompanies}
            </p>
            <span className="ml-2 text-sm font-medium text-green-500">Operational</span>
          </div>
        </div>

        <div className="p-5 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 truncate">Suspended Companies</p>
          </div>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-semibold text-brand-900">
              {status === 'loading' ? '...' : suspendedCompanies}
            </p>
            <span className="ml-2 text-sm font-medium text-red-500">Locked</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;