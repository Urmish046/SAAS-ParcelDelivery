import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParcels, createParcel, updateParcelStatus, deleteParcel } from '../../features/parcels/parcelsSlice';
import { fetchCustomers } from '../../features/customers/customersSlice';
import { fetchWarehouses } from '../../features/warehouses/warehousesSlice';
import type { AppDispatch, RootState } from '../../store/store';

const PARCEL_STATUSES = [
  { value: 'pending', label: 'Pending (Not Arrived)' },
  { value: 'scanned', label: 'Received & Scanned' },
  { value: 'shipped', label: 'Shipped to Destination' },
  { value: 'available_for_pickup', label: 'Ready for Pickup' },
  { value: 'completed', label: 'Completed / Delivered' },
  { value: 'returned', label: 'Returned' }
];

const ParcelsManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { parcelsList, status, error } = useSelector((state: RootState) => state.parcels);
  const { customersList } = useSelector((state: RootState) => state.customers);
  const { warehouses } = useSelector((state: RootState) => state.warehouses);

  let currentRole = user?.role;
  const token = localStorage.getItem('token');
  
  if (!currentRole && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentRole = payload.role;
    } catch (e) {}
  }

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const [originalTrackingNumber, setOriginalTrackingNumber] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  const [newStatus, setNewStatus] = useState('');
  const [customerTrackingId, setCustomerTrackingId] = useState('');
  
  const [updateWeight, setUpdateWeight] = useState('');
  const [updateShippingCost, setUpdateShippingCost] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchParcels());
    dispatch(fetchCustomers());
    dispatch(fetchWarehouses());
  }, [status, dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originalTrackingNumber && description && weight && customerId && warehouseId) {
      const payload: any = {
        originalTrackingNumber,
        description,
        weight: parseFloat(weight),
        customerId,
        warehouseId
      };

      const resultAction = await dispatch(createParcel(payload));
      
      if (createParcel.fulfilled.match(resultAction)) {
        setIsCreateModalOpen(false);
        setOriginalTrackingNumber(''); setDescription(''); setWeight(''); setCustomerId(''); setWarehouseId('');
        dispatch(fetchParcels()); 
      } else {
        console.log("Backend Error:", resultAction.payload);
      }
    }
  };

  const handleOpenStatusModal = (parcel: any) => {
    setSelectedParcel(parcel);
    setNewStatus(parcel.status);
    setCustomerTrackingId(parcel.customerTrackingId || '');
    setUpdateWeight(parcel.weight?.toString() || '');
    setUpdateShippingCost(parcel.shippingCost?.toString() || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParcel && newStatus) {
      const resultAction = await dispatch(updateParcelStatus({
        id: selectedParcel.id,
        status: newStatus,
        customerTrackingId: newStatus === 'shipped' ? customerTrackingId : undefined,
        weight: newStatus === 'scanned' && updateWeight ? parseFloat(updateWeight) : undefined,
        shippingCost: newStatus === 'scanned' && updateShippingCost ? parseFloat(updateShippingCost) : undefined
      }));

      if (updateParcelStatus.fulfilled.match(resultAction)) {
        setIsStatusModalOpen(false);
        setSelectedParcel(null);
        dispatch(fetchParcels()); 
      } else {
        alert(`Error: ${resultAction.payload}`); 
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this parcel?')) {
      dispatch(deleteParcel(id));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel || !imageFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`http://localhost:3000/parcels/${selectedParcel.id}/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setIsImageModalOpen(false);
        setImageFile(null);
        dispatch(fetchParcels());
      } else {
        const data = await response.json();
        alert(`Upload Error: ${data.message || 'Failed to upload'}`);
      }
    } catch (err) {
      alert('Network error during image upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">
            {currentRole === 'warehouse_staff' ? 'Warehouse Parcels' : 'All Parcels'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentRole === 'warehouse_staff' 
              ? 'Manage inbound and outbound packages for your location' 
              : 'Manage all inbound and outbound packages'}
          </p>
        </div>
        {currentRole === 'company_admin' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-brand-500 rounded-lg shadow-sm hover:bg-brand-900 hover:shadow-md active:scale-95"
          >
            + Add Parcel
          </button>
        )}
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Tracking & Details</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Customer & Warehouse</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-brand-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50">
              {status === 'loading' && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 animate-pulse">Loading parcels...</td></tr>
              )}
              {status === 'succeeded' && parcelsList.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No parcels found.</td></tr>
              )}
              {status === 'succeeded' && parcelsList.map((parcel) => (
                <tr key={parcel.id} className="transition-colors hover:bg-brand-100/20">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-brand-900">{parcel.internalTrackingId}</div>
                    <div className="text-sm text-gray-900 mt-1">{parcel.description}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {parcel.weight} kg {parcel.shippingCost && `• Shipping: $${parcel.shippingCost}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-brand-900">{parcel.customer?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500 mt-1">{parcel.warehouse?.name || 'Unknown Warehouse'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${parcel.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        parcel.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        parcel.status === 'returned' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {parcel.status.replace(/_/g, ' ')}
                    </span>
                    {parcel.customerTrackingId && (
                      <div className="text-xs text-gray-500 mt-1">Trk: {parcel.customerTrackingId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right space-x-3">
                    <button
                      onClick={() => handleOpenStatusModal(parcel)}
                      className="text-brand-500 hover:text-brand-900 transition-colors font-medium px-2 py-1 rounded hover:bg-brand-100/50"
                    >
                      Update Status
                    </button>
                    
{['company_admin', 'warehouse_staff'].includes(currentRole || '') && (                      <button
                        onClick={() => { setSelectedParcel(parcel); setImageFile(null); setIsImageModalOpen(true); }}
                        className="text-blue-500 hover:text-blue-700 transition-colors font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Images
                      </button>
                    )}

                    {currentRole === 'company_admin' && (
                      <button
                        onClick={() => handleDelete(parcel.id)}
                        className="text-red-500 hover:text-red-700 transition-colors font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && currentRole === 'company_admin' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg p-7 bg-white shadow-2xl rounded-2xl border border-brand-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-xl font-bold text-brand-900">Add New Parcel</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Original Tracking No.</label>
                <input type="text" value={originalTrackingNumber} onChange={(e) => setOriginalTrackingNumber(e.target.value)} required placeholder="e.g., TBA123456789" className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-brand-900">Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="e.g., PS5" className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-brand-900">Est. Weight (kg)</label>
                  <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Select Customer</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900">
                  <option value="" disabled>Select a customer</option>
                  {customersList.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Select Warehouse</label>
                <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900">
                  <option value="" disabled>Select a warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end pt-4 space-x-3 mt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium rounded-lg text-brand-900 bg-brand-100 hover:bg-brand-300 transition-colors duration-200">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-900 shadow-sm transition-colors duration-200">Save Parcel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStatusModalOpen && selectedParcel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div 
            className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-xl font-bold text-brand-900">Update Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Parcel Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900 capitalize">
                  {PARCEL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {newStatus === 'scanned' && (
                <div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
                  <h4 className="text-sm font-bold text-brand-900 border-b border-brand-200 pb-2">Data Capture</h4>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">Actual Weight (kg)</label>
                    <input type="number" step="0.01" value={updateWeight} onChange={(e) => setUpdateWeight(e.target.value)} required className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">Shipping Cost ($)</label>
                    <input type="number" step="0.01" value={updateShippingCost} onChange={(e) => setUpdateShippingCost(e.target.value)} required className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" />
                  </div>
                </div>
              )}
              
              {newStatus === 'shipped' && (
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-brand-900">Final Tracking ID (e.g., DHL/FedEx)</label>
                  <input type="text" value={customerTrackingId} onChange={(e) => setCustomerTrackingId(e.target.value)} required className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" />
                </div>
              )}

              <div className="flex justify-end pt-4 space-x-3 mt-2">
                <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-5 py-2 text-sm font-medium rounded-lg text-brand-900 bg-brand-100 hover:bg-brand-300 transition-colors duration-200">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-900 shadow-sm transition-colors duration-200">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImageModalOpen && selectedParcel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div 
            className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-xl font-bold text-brand-900">Manage Parcel Images</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-brand-900 mb-2">Uploaded Images</h4>
              {selectedParcel.imageUrls && selectedParcel.imageUrls.length > 0 ? (
                <ul className="space-y-1">
                  {selectedParcel.imageUrls.map((img: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded border truncate" title={img}>
                      {img.split('/').pop()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">No images uploaded yet.</p>
              )}
            </div>

            <form onSubmit={handleImageUpload} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Upload New Image</label>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageFileChange} 
                  required 
                  className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" 
                />
              </div>

              <div className="flex justify-end pt-4 space-x-3 mt-2">
                <button type="button" onClick={() => setIsImageModalOpen(false)} className="px-5 py-2 text-sm font-medium rounded-lg text-brand-900 bg-brand-100 hover:bg-brand-300 transition-colors duration-200" disabled={isUploading}>Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-900 shadow-sm transition-colors duration-200" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelsManagement;