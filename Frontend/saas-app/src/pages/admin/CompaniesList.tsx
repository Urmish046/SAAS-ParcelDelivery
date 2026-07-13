import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import {
  createCompany,
  fetchCompanies,
  updateCompany,
  toggleCompanyStatus,
} from '../../features/companies/companiesSlice';

const CompaniesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, status, createStatus, error } = useSelector((state: RootState) => state.companies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', adminEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ name: '', adminEmail: '' });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCompanies());
    }
  }, [status, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const generatedSubdomain = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-') 
      .replace(/-+/g, '-')      
      .replace(/^-|-$/g, '');     

    
    const payload = {
      ...formData,
      subdomain: generatedSubdomain,
    };

  
    const resultAction = await dispatch(createCompany(payload as any));

    if (createCompany.fulfilled.match(resultAction)) {
      setIsModalOpen(false);
      setFormData({ name: '', adminEmail: '', password: '' });
    }
  };

  const handleEditClick = (company: any) => {
    setEditingCompany(company);
    setEditFormData({ name: company.name, adminEmail: company.adminEmail });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    await dispatch(updateCompany({ id: editingCompany.id, data: editFormData }));
    setIsEditModalOpen(false);
    setEditingCompany(null);
  };

  const handleSuspendClick = (company: any) => {
    const newStatus = company.status === 'suspended' ? 'active' : 'suspended';
    dispatch(toggleCompanyStatus({ id: company.id, status: newStatus }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">

      {/* Header & Action Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-900">Registered Companies</h3>
          <p className="text-sm text-gray-500 mt-1">Manage all tenant companies operating on the platform.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white transition-colors bg-brand-900 rounded-md hover:bg-brand-500 shadow-sm"
        >
          + Add New Company
        </button>
      </div>

      {/* State Handlers (Loading / Error) */}
      {status === 'loading' && <p className="text-sm text-gray-500 animate-pulse">Loading companies data...</p>}
      {error && status === 'failed' && <p className="text-sm text-red-500">Error: {error}</p>}

      {/* Companies Table */}
      {status === 'succeeded' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No companies found. Click "Add New Company" to get started.
                    </td>
                  </tr>
                ) : (
                  companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-900">{company.name}</td>
                      <td className="px-6 py-4">{company.adminEmail || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            company.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {company.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleEditClick(company)}
                          className="text-brand-500 hover:text-brand-900 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSuspendClick(company)}
                          className="text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          {company.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-900">Add New Company</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Company Name</label>
                <input
                  type="text" name="name" required
                  value={formData.name} onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. FastCargo Logistics"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Admin Email</label>
                <input
                  type="email" name="adminEmail" required
                  value={formData.adminEmail} onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="admin@fastcargo.com"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Initial Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" required
                    value={formData.password} onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Set a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      // Eye-off icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {createStatus === 'failed' && (
                <div className="p-2 text-xs text-red-700 bg-red-100 rounded-md">Error creating company.</div>
              )}

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={createStatus === 'loading'} className="px-4 py-2 text-sm font-medium text-white transition-colors bg-brand-900 rounded-md hover:bg-brand-500 disabled:opacity-50">
                  {createStatus === 'loading' ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-900">Edit Company</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Company Name</label>
                <input
                  type="text" name="name" required
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Admin Email</label>
                <input
                  type="email" name="adminEmail" required
                  value={editFormData.adminEmail}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white transition-colors bg-brand-900 rounded-md hover:bg-brand-500">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompaniesList;