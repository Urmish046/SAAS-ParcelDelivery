import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../features/customers/customersSlice';
import type { AppDispatch, RootState } from '../../store/store';

const CustomersManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customersList, status, error } = useSelector((state: RootState) => state.customers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCustomers());
    }
  }, [status, dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && phone && password) {
      await dispatch(createCustomer({ name, email, phone, password, address }));
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setAddress('');
    }
  };

  const handleEditClick = (customer: any) => {
    setEditingId(customer.id);
    setEditName(customer.name);
    setEditEmail(customer.email);
    setEditPhone(customer.phone);
    setEditAddress(customer.address || '');
    setEditPassword('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editName && editEmail && editPhone) {
      const updateData: any = { name: editName, email: editEmail, phone: editPhone, address: editAddress };
      if (editPassword) {
        updateData.password = editPassword;
      }
      await dispatch(updateCustomer({ id: editingId, data: updateData }));
      setIsEditModalOpen(false);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      dispatch(deleteCustomer(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your customer base</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-brand-500 rounded-lg shadow-sm hover:bg-brand-900 hover:shadow-md active:scale-95"
        >
          + Add Customer
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Address</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-brand-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50">
              {status === 'loading' && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 animate-pulse">Loading customers...</td>
                </tr>
              )}
              {status === 'succeeded' && customersList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No customers found. Create one to get started.</td>
                </tr>
              )}
              {status === 'succeeded' && customersList.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-brand-100/20">
                  <td className="px-6 py-4 text-sm font-medium text-brand-900">{customer.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {customer.address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right space-x-3">
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="text-brand-500 hover:text-brand-900 transition-colors font-medium px-2 py-1 rounded hover:bg-brand-100/50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
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
          <div className="w-full max-w-lg p-7 bg-white shadow-2xl rounded-2xl border border-brand-100">
            <h3 className="mb-6 text-xl font-bold text-brand-900">Add New Customer</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block mb-1.5 text-sm font-medium text-brand-900">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                  />
                </div>
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
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Address (Optional)</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900 resize-none"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-3 mt-2">
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg p-7 bg-white shadow-2xl rounded-2xl border border-brand-100">
            <h3 className="mb-6 text-xl font-bold text-brand-900">Edit Customer</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block mb-1.5 text-sm font-medium text-brand-900">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">New Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Address (Optional)</label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm transition-colors border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-brand-900 resize-none"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-3 mt-2">
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
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;