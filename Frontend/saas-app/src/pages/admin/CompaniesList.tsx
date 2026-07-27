import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchPlans } from '../../features/plans/plansSlice';
import {
  createCompany,
  fetchCompanies,
  updateCompany,
  activateCompany,
  suspendCompany,
} from '../../features/companies/companiesSlice';

const CompaniesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, status, createStatus, error } = useSelector((state: RootState) => state.companies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', adminEmail: '', password: '', country: '', subdomain: '', planId: '' });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ name: '', adminEmail: '', country: '', subdomain: '' });

  const { plansList } = useSelector((state: RootState) => state.plans);

useEffect(() => {
  dispatch(fetchPlans());
}, [dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCompanies());
    }
  }, [status, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSubdomain = formData.subdomain
      ? formData.subdomain.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const payload: any = { ...formData, subdomain: finalSubdomain };
    if (!payload.planId || payload.planId.trim() === '') {
      delete payload.planId;
    }

    const resultAction = await dispatch(createCompany(payload as any));

    if (createCompany.fulfilled.match(resultAction)) {
      setIsModalOpen(false);
      setFormData({ name: '', adminEmail: '', password: '', country: '', subdomain: '', planId: '' });
    }
  };

  const handleEditClick = (company: any) => {
    setEditingCompany(company);
    setEditFormData({
      name: company.name,
      adminEmail: company.adminEmail || '',
      country: company.country || '',
      subdomain: company.subdomain || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    
    const formattedSubdomain = editFormData.subdomain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const payload = { ...editFormData, subdomain: formattedSubdomain };

    await dispatch(updateCompany({ id: editingCompany.id, data: payload }));
    setIsEditModalOpen(false);
    setEditingCompany(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
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

      {status === 'loading' && <p className="text-sm text-gray-500 animate-pulse">Loading companies data...</p>}
      {error && status === 'failed' && <p className="text-sm text-red-500">Error: {error}</p>}

      {status === 'succeeded' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Portal URL</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No companies found. Click "Add New Company" to get started.
                    </td>
                  </tr>
                ) : (
                  companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-900">{company.name}</td>
                      <td className="px-6 py-4">{company.country || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-600">{company.subdomain ? `${company.subdomain}.domain.com` : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            company.subscriptionStatus === 'suspended' ? 'bg-red-100 text-red-700' :
                            company.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {company.subscriptionStatus === 'suspended' ? 'Suspended' : 
                           company.subscriptionStatus === 'active' ? 'Active' : 'Trial (Pending Payment)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => handleEditClick(company)} className="text-gray-500 hover:text-brand-900 font-medium cursor-pointer">
                          Edit
                        </button>
                        
                        {company.subscriptionStatus !== 'active' && (
                          <button onClick={() => dispatch(activateCompany(company.id))} className="text-green-600 hover:text-green-800 font-medium">
                            Activate
                          </button>
                        )}
                        {company.subscriptionStatus === 'active' && (
                          <button onClick={() => dispatch(suspendCompany(company.id))} className="text-red-500 hover:text-red-700 font-medium">
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md p-6 my-8 bg-white rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-900">Add New Company</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Company Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Select Plan</label>
               <select name="planId" value={formData.planId} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md text-gray-700 bg-white">
  <option value="">Select a subscription plan (Optional for now)</option>
  {plansList.map((plan) => (
    <option key={plan.id} value={plan.id}>
      {plan.name} Plan - ${plan.price}/{plan.billingCycle === 'yearly' ? 'yr' : 'mo'}
    </option>
  ))}
</select>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Operating Country</label>
                <input type="text" name="country" required value={formData.country} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Portal URL</label>
                <input type="text" name="subdomain" value={formData.subdomain} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" placeholder="Auto-generated if empty" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Admin Email</label>
                <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border rounded-md" />
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={createStatus === 'loading'} className="px-4 py-2 text-sm text-white bg-brand-900 rounded-md">
                  {createStatus === 'loading' ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md p-6 my-8 bg-white rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-900">Edit Company</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Company Name</label>
                <input type="text" name="name" required value={editFormData.name} onChange={handleEditInputChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Operating Country</label>
                <input type="text" name="country" required value={editFormData.country} onChange={handleEditInputChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Portal URL (Subdomain)</label>
                <input type="text" name="subdomain" required value={editFormData.subdomain} onChange={handleEditInputChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500 uppercase">Admin Email</label>
                <input type="email" name="adminEmail" required value={editFormData.adminEmail} onChange={handleEditInputChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500" />
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