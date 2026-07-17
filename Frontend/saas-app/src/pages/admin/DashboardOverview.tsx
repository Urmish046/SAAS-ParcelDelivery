import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight } from 'lucide-react';
import { fetchParcels } from '../../features/parcels/parcelsSlice';
import { fetchCustomers } from '../../features/customers/customersSlice';
import { fetchWarehouses } from '../../features/warehouses/warehousesSlice';
import { fetchStaff } from '../../features/staff/staffSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { Navigate } from 'react-router-dom';

const STATUS_STAGES = [
  { key: 'received', label: 'Received', color: '#94A3B8' },
  { key: 'in_transit', label: 'In Transit', color: '#5B8C8C' },
  { key: 'customs', label: 'Customs', color: '#C9A26D' },
  { key: 'available_for_pickup', label: 'Ready for Pickup', color: '#2F4550' },
  { key: 'completed', label: 'Completed', color: '#1B2B33' },
];

const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const { parcelsList } = useSelector((state: RootState) => state.parcels);
  const { customersList } = useSelector((state: RootState) => state.customers);
  const { warehouses } = useSelector((state: RootState) => state.warehouses);
  const { staffList } = useSelector((state: RootState) => state.staff);

  let currentRole = user?.role;
  const token = localStorage.getItem('token');
  
  if (!currentRole && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentRole = payload.role;
    } catch (e) {}
  }

  if (currentRole === 'warehouse_staff') {
    return <Navigate to="/dashboard/parcels" replace />;
  }

  useEffect(() => {
    dispatch(fetchParcels());
    dispatch(fetchCustomers());
    dispatch(fetchWarehouses());
    dispatch(fetchStaff());
  }, [dispatch]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_STAGES.forEach((s) => (counts[s.key] = 0));
    (parcelsList || []).forEach((p: any) => {
      const key = (p.status || 'received').toLowerCase();
      if (counts[key] !== undefined) counts[key] += 1;
      else counts.received += 1;
    });
    return counts;
  }, [parcelsList]);

  const totalParcels = parcelsList?.length || 0;

  const recentParcels = useMemo(() => {
    return (parcelsList || [])
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [parcelsList]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div className="flex items-end justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{today}</p>
          <h2 className="text-xl font-semibold text-brand-900 mt-0.5">Operations Overview</h2>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Active Warehouses</p>
          <p className="text-sm font-medium text-brand-900 tabular-nums">{warehouses?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 border border-gray-200 rounded-md bg-white">
        {[
          { label: 'Total Parcels', value: totalParcels },
          { label: 'Customers', value: customersList?.length || 0 },
          { label: 'Warehouses', value: warehouses?.length || 0 },
          { label: 'Staff', value: staffList?.length || 0 },
        ].map((stat, i) => (
          <div key={i} className="px-5 py-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-brand-900 tabular-nums mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-md bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-brand-900">Parcels by Stage</h3>
          <span className="text-xs text-gray-400 tabular-nums">{totalParcels} total</span>
        </div>

        {totalParcels === 0 ? (
          <p className="text-sm text-gray-400">No parcels in the system yet.</p>
        ) : (
          <>
            <div className="flex h-2.5 w-full overflow-hidden rounded-sm bg-gray-100">
              {STATUS_STAGES.map((stage) => {
                const count = statusCounts[stage.key];
                const pct = totalParcels ? (count / totalParcels) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={stage.key}
                    style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    title={`${stage.label}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {STATUS_STAGES.map((stage) => (
                <div key={stage.key} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: stage.color }} />
                  <span className="text-gray-500">{stage.label}</span>
                  <span className="font-medium text-brand-900 tabular-nums">{statusCounts[stage.key]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-brand-900">Recent Parcels</h3>
          <button className="text-xs font-medium text-brand-500 hover:text-brand-900 flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </button>
        </div>

        {recentParcels.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            No parcels have been added yet.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2 font-medium">Tracking No.</th>
                <th className="px-5 py-2 font-medium">Customer</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentParcels.map((parcel: any) => (
                <tr key={parcel.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-brand-900">
                    {parcel.trackingNumber || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {parcel.customerName || parcel.customer?.name || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600 capitalize">
                      {(parcel.status || 'received').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400 tabular-nums">
                    {parcel.createdAt
                      ? new Date(parcel.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;