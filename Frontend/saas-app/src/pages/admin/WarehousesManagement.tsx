import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWarehouses, createWarehouse, deleteWarehouse, updateWarehouse } from '../../features/warehouses/warehousesSlice';
import type { AppDispatch, RootState } from '../../store/store';

const WarehousesManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { warehouses, status, error } = useSelector((state: RootState) => state.warehouses);

  // Create Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchWarehouses());
    }
  }, [status, dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && location) {
      await dispatch(createWarehouse({ name, location }));
      setIsModalOpen(false);
      setName('');
      setLocation('');
    }
  };

  const handleEditClick = (warehouse: any) => {
    setEditingId(warehouse.id);
    setEditName(warehouse.name);
    setEditLocation(warehouse.location);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editName && editLocation) {
      await dispatch(updateWarehouse({ 
        id: editingId, 
        data: { name: editName, location: editLocation } 
      }));
      setIsEditModalOpen(false);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      dispatch(deleteWarehouse(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Warehouses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your storage and distribution centers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-brand-500 rounded-lg shadow-sm hover:bg-brand-900 hover:shadow-md active:scale-95"
        >
          + Add Warehouse
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="bg-white border rounded-xl shadow-sm border-brand-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-100">
            <thead className="bg-brand-100/40">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Location</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-brand-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50">
              {status === 'loading' && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400 animate-pulse">Loading warehouses...</td>
                </tr>
              )}
              {status === 'succeeded' && warehouses.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No warehouses found. Create one to get started.</td>
                </tr>
              )}
              {status === 'succeeded' && warehouses.map((warehouse: any) => (
                <tr key={warehouse.id} className="transition-colors hover:bg-brand-100/20">
                  <td className="px-6 py-4 text-sm font-medium text-brand-900">{warehouse.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{warehouse.location}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right space-x-3">
                    <button
                      onClick={() => handleEditClick(warehouse)}
                      className="text-brand-500 hover:text-brand-900 transition-colors font-medium px-2 py-1 rounded hover:bg-brand-100/50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
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

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100">
            <h3 className="mb-6 text-xl font-bold text-brand-900">Add New Warehouse</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karachi Main Hub"
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Plot 12, Korangi Industrial Area"
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900 placeholder:text-gray-400"
                />
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
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100">
            <h3 className="mb-6 text-xl font-bold text-brand-900">Edit Warehouse</h3>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                />
              </div>
              <div className="flex justify-end pt-5 space-x-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium transition-colors rounded-lg text-brand-900 bg-brand-100 hover:bg-brand-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-900 shadow-sm"
                >
                  Update Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesManagement;