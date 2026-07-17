import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, createStaff, deleteStaff } from '../../features/staff/staffSlice';
import { fetchWarehouses } from '../../features/warehouses/warehousesSlice';
import type { AppDispatch, RootState } from '../../store/store';

const StaffManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { staffList, status, error } = useSelector((state: RootState) => state.staff);
  const { warehouses } = useSelector((state: RootState) => state.warehouses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStaff());
    }
    dispatch(fetchWarehouses());
  }, [status, dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && warehouseId) {
      await dispatch(createStaff({ name, email, password, warehouseId }));
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setWarehouseId('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      dispatch(deleteStaff(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Staff</h2>
          <p className="text-sm text-gray-500 mt-1">Manage warehouse staff members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-brand-500 rounded-lg shadow-sm hover:bg-brand-900 hover:shadow-md active:scale-95"
        >
          + Add Staff
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm border-brand-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-100">
            <thead className="bg-brand-100/40">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Warehouse</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-brand-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50">
              {status === 'loading' && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 animate-pulse">Loading staff...</td>
                </tr>
              )}
              {status === 'succeeded' && staffList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No staff members found. Create one to get started.</td>
                </tr>
              )}
              {status === 'succeeded' && staffList.map((staff) => (
                <tr key={staff.id} className="transition-colors hover:bg-brand-100/20">
                  <td className="px-6 py-4 text-sm font-medium text-brand-900">{staff.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{staff.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {staff.warehouse?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="text-red-500 hover:text-red-700 transition-colors font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100">
            <h3 className="mb-6 text-xl font-bold text-brand-900">Add New Staff</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Assign Warehouse</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                >
                  <option value="" disabled>Select a warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-5 space-x-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium transition-colors rounded-lg text-brand-900 bg-brand-100 hover:bg-brand-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-900 shadow-sm"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;