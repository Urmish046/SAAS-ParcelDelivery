import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParcels, scanBarcode, updateParcelStatus, deleteParcel } from '../../features/parcels/parcelsSlice';
import { fetchCustomers } from '../../features/customers/customersSlice';
import { fetchWarehouses } from '../../features/warehouses/warehousesSlice';
import { Html5QrcodeScanner } from 'html5-qrcode';
import type { AppDispatch, RootState } from '../../store/store';

interface Parcel {
  id: string;
  status: string;
  originalTrackingNumber?: string;
  customerTrackingId?: string;
  internalTrackingId?: string;
  weight?: number;
  shippingCost?: number;
  description?: string;
  isCustomerConfirmed?: boolean;
  paymentReceiptUrl?: string;
  customer?: { name: string };
  originWarehouseId?: string;
  originWarehouse?: { id: string; name: string };
  destinationWarehouseId?: string;
  destinationWarehouse?: { id: string; name: string };
}

const PARCEL_STATUSES = [
  { value: 'pending', label: 'Pending (Not Arrived)' },
  { value: 'scanned', label: 'Received & Scanned' },
  { value: 'shipped', label: 'Shipped to Destination' },
  { value: 'available_for_pickup', label: 'Ready for Pickup' },
  { value: 'payment_under_review', label: 'Payment Under Review' },
  { value: 'completed', label: 'Completed / Delivered' },
  { value: 'returned', label: 'Returned' }
];

const ParcelsManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user, token } = useSelector((state: RootState) => state.auth);
  const { parcelsList, status, error } = useSelector((state: RootState) => state.parcels);
  const { customersList } = useSelector((state: RootState) => state.customers);
  const { warehouses } = useSelector((state: RootState) => state.warehouses);

  const { currentRole, currentWarehouseId } = useMemo(() => {
    let role = user?.role;
    let warehouseId = (user as any)?.warehouseId;

    if ((!role || !warehouseId) && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!role) role = payload.role;
        if (!warehouseId) warehouseId = payload.warehouseId;
      } catch (e) {
        console.error('Failed to parse auth token payload', e);
      }
    }
    return { currentRole: role, currentWarehouseId: warehouseId };
  }, [user, token]);

  const currentWarehouseName = useMemo(() =>
    warehouses.find(w => w.id === currentWarehouseId)?.name,
  [warehouses, currentWarehouseId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [customerTrackingId, setCustomerTrackingId] = useState('');
  const [updateWeight, setUpdateWeight] = useState('');
  const [updateShippingCost, setUpdateShippingCost] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateDescription, setUpdateDescription] = useState('');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchParcels());
    dispatch(fetchCustomers());
    dispatch(fetchWarehouses());
  }, [status, dispatch]);


  useEffect(() => {
    const handleFocus = () => dispatch(fetchParcels());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  const canUserUpdateParcel = (parcel: Parcel): boolean => {
    if (currentRole === 'company_admin') return true;
    if (currentRole !== 'warehouse_staff') return false;

    const originWhId = parcel.originWarehouseId || parcel.originWarehouse?.id;
    const destWhId = parcel.destinationWarehouseId || parcel.destinationWarehouse?.id;

    if (['shipped', 'available_for_pickup', 'payment_under_review', 'completed', 'returned'].includes(parcel.status)) {
      if (currentWarehouseId === originWhId && currentWarehouseId !== destWhId) return false;
      if (currentWarehouseId === destWhId) return true;
    } else {
      if (currentWarehouseId === originWhId) return true;
      if (currentWarehouseId === destWhId && currentWarehouseId !== originWhId) return false;
    }
    return true;
  };

  const getAvailableStatusesForParcel = (parcel: Parcel | null) => {
    if (!parcel) return PARCEL_STATUSES;
    if (currentRole === 'company_admin') return PARCEL_STATUSES;

    const originWhId = parcel.originWarehouseId || parcel.originWarehouse?.id;
    const destWhId = parcel.destinationWarehouseId || parcel.destinationWarehouse?.id;

    if (currentRole === 'warehouse_staff' && currentWarehouseId === destWhId && currentWarehouseId !== originWhId) {
      return PARCEL_STATUSES.filter(s => ['shipped', 'available_for_pickup', 'payment_under_review', 'completed', 'returned'].includes(s.value));
    }
    if (currentRole === 'warehouse_staff' && currentWarehouseId === originWhId) {
      return PARCEL_STATUSES.filter(s => ['pending', 'scanned', 'shipped'].includes(s.value));
    }
    return PARCEL_STATUSES;
  };

  const processScannedCode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const existingParcel = parcelsList.find(
      p => p.originalTrackingNumber?.toLowerCase() === cleanCode.toLowerCase() || 
           p.customerTrackingId?.toLowerCase() === cleanCode.toLowerCase() ||
           p.internalTrackingId?.toLowerCase() === cleanCode.toLowerCase()
    );

    if (existingParcel) {
      if (canUserUpdateParcel(existingParcel)) {
        handleOpenStatusModal(existingParcel, false);
      } else {
        alert('This parcel has been shipped. Status updates must be performed by the destination warehouse.');
      }
      setSearchQuery('');
    } else if (currentRole === 'warehouse_staff' || currentRole === 'company_admin') {
      const resultAction = await dispatch(scanBarcode(cleanCode));
      
      if (scanBarcode.fulfilled.match(resultAction)) {
        dispatch(fetchParcels()); 
        setNotificationBanner('New parcel arrived and registered at warehouse.');
        handleOpenStatusModal(resultAction.payload, true);
        setSearchQuery('');
      } else {
        alert(`Error: Tracking ID not found in system or customer requests. Error: ${resultAction.payload}`);
      }
    } else {
      alert('Parcel not found in current view.');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processScannedCode(searchQuery);
    }
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let isMounted = true;

    if (isCameraScanning) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 150 } }, false);
      scanner.render(
        (decodedText) => {
          if (scanner && isMounted) scanner.clear().catch(e => console.error(e));
          setIsCameraScanning(false);
          setSearchQuery(decodedText);
          processScannedCode(decodedText);
        },
        () => {}
      );
    }
    return () => {
      isMounted = false;
      if (scanner) scanner.clear().catch(e => console.error(e));
    };
  }, [isCameraScanning, currentRole, dispatch, parcelsList]);

  const handleOpenStatusModal = (parcel: Parcel, isNewlyScanned: boolean = false) => {
    setSelectedParcel(parcel);
    setNewStatus(isNewlyScanned ? 'scanned' : parcel.status);
    setCustomerTrackingId(parcel.customerTrackingId || '');
    setUpdateWeight(parcel.weight?.toString() || '');
    setUpdateShippingCost(parcel.shippingCost?.toString() || '');
    setUpdateDescription(isNewlyScanned ? '' : (parcel.description || ''));
    setImageFile(null);
    setIsStatusModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = e.target.value;
    setUpdateWeight(newWeight);
    if (newWeight && !isNaN(parseFloat(newWeight))) {
      const calculatedCost = (parseFloat(newWeight) * 10 + 15).toFixed(2);
      setUpdateShippingCost(calculatedCost.toString());
    } else {
      setUpdateShippingCost('');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParcel && newStatus) {
      setIsUpdating(true);

      const resultAction = await dispatch(updateParcelStatus({
        id: selectedParcel.id,
        status: newStatus,
        customerTrackingId: newStatus === 'shipped' ? customerTrackingId : undefined,
        weight: newStatus === 'scanned' && updateWeight ? parseFloat(updateWeight) : undefined,
        shippingCost: newStatus === 'scanned' && updateShippingCost ? parseFloat(updateShippingCost) : undefined,
        description: newStatus === 'scanned' ? updateDescription : undefined,
      }));

      if (updateParcelStatus.fulfilled.match(resultAction)) {
        if (newStatus === 'scanned' && imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);

          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/parcels/${selectedParcel.id}/upload-image`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });

            if (!response.ok) {
              const data = await response.json();
              alert(`Status updated, but image upload failed: ${data.message || 'Failed to upload'}`);
            }
          } catch (err) {
            alert('Status updated, but network error occurred during image upload.');
          }
        }

        setIsStatusModalOpen(false);
        setSelectedParcel(null);
        setImageFile(null);
        setSearchQuery('');
        dispatch(fetchParcels()); 
      } else {
        alert(`Error: ${resultAction.payload}`); 
      }
      setIsUpdating(false);
    }
  };

  const handleApprovePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to approve this payment? This will mark the parcel as Completed.')) {
      await dispatch(updateParcelStatus({ id, status: 'completed' }));
      dispatch(fetchParcels());
    }
  };

  const handleRejectPayment = async (id: string) => {
    if (window.confirm('Are you sure you want to reject this payment?')) {
      await dispatch(updateParcelStatus({ id, status: 'available_for_pickup' }));
      dispatch(fetchParcels());
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this parcel?')) dispatch(deleteParcel(id));
  };

  const filteredParcels = useMemo(() => {
    return parcelsList.filter((parcel) => {
      if (currentRole === 'warehouse_staff') {
        const originWhId = parcel.originWarehouseId || parcel.originWarehouse?.id;
        const destWhId = parcel.destinationWarehouseId || parcel.destinationWarehouse?.id;
        if (originWhId !== currentWarehouseId && destWhId !== currentWarehouseId) return false;
      }
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        parcel.originalTrackingNumber?.toLowerCase().includes(query) ||
        parcel.internalTrackingId?.toLowerCase().includes(query) ||
        parcel.customerTrackingId?.toLowerCase().includes(query)
      );
    });
  }, [parcelsList, currentRole, currentWarehouseId, searchQuery]);


  const inboundDestinationParcels = useMemo(() => parcelsList.filter((p) => {
    const destWhId = p.destinationWarehouseId || p.destinationWarehouse?.id;
    return p.status === 'shipped' && destWhId === currentWarehouseId;
  }), [parcelsList, currentWarehouseId]);

  const originNewlyScannedParcels = useMemo(() => parcelsList.filter((p) => {
    const originWhId = p.originWarehouseId || p.originWarehouse?.id;
    return p.status === 'scanned' && originWhId === currentWarehouseId;
  }), [parcelsList, currentWarehouseId]);


  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-2xl font-bold text-brand-900">
          {currentRole === 'warehouse_staff'
            ? (currentWarehouseName ? `${currentWarehouseName} Parcels` : 'Warehouse Parcels')
            : 'All Parcels'}
        </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentRole === 'warehouse_staff'
              ? 'Scan or type tracking ID to receive and manage packages'
              : 'Manage all inbound and outbound packages'}
          </p>
        </div>
      </div>

      {notificationBanner && (
        <div className="p-4 text-sm text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-lg flex justify-between items-center shadow-sm">
          <span className="font-medium"> {notificationBanner}</span>
          <button 
            onClick={() => setNotificationBanner(null)} 
            className="font-bold text-emerald-900 hover:text-emerald-950 px-2"
          >
            &times;
          </button>
        </div>
      )}

      {currentRole === 'warehouse_staff' && inboundDestinationParcels.length > 0 && (
        <div className="p-4 text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <span className="font-bold">Incoming Shipment Alert:</span> You have{' '}
            <span className="font-bold underline">{inboundDestinationParcels.length}</span> parcel(s) shipped to your destination warehouse. You can now update their status upon arrival.
          </div>
        </div>
      )}

      {currentRole === 'warehouse_staff' && originNewlyScannedParcels.length > 0 && (
        <div className="p-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <span className="font-bold">Warehouse Arrival Notice:</span> You have{' '}
            <span className="font-bold underline">{originNewlyScannedParcels.length}</span> parcel(s) recently received and scanned at your origin warehouse.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 sm:text-sm"></span>
          </div>
          <input
            type="text"
            placeholder="Search or Press Enter to Receive Parcel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg shadow-sm border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-900 bg-white"
          />
        </div>
        
        <button
          onClick={() => setIsCameraScanning(true)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-900 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          Scan via Camera
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {isCameraScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-brand-900">Scan Barcode with Camera</h3>
              <button 
                onClick={() => setIsCameraScanning(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>
            <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
            <p className="text-xs text-gray-500 text-center">Position the barcode inside the frame to scan automatically.</p>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm border-brand-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-100">
            <thead className="bg-brand-100/40">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Tracking & Details</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Route</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-brand-900 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-brand-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50">
              {status === 'loading' && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 animate-pulse">Loading parcels...</td></tr>
              )}
              {status === 'succeeded' && filteredParcels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {searchQuery ? 'No parcels match your search. Press Enter to try receiving it.' : 'No parcels found.'}
                  </td>
                </tr>
              )}
              {status === 'succeeded' && filteredParcels.map((parcel) => {
                const isEditable = canUserUpdateParcel(parcel);
                const isCompleted = parcel.status === 'completed';

                return (
                  <tr key={parcel.id}  className={`transition-colors ${
                    isCompleted 
                      ? 'bg-gray-50/60 opacity-70' 
                      : 'hover:bg-brand-100/20'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-brand-900">{parcel.originalTrackingNumber || parcel.internalTrackingId}</div>
                       {isCompleted && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 uppercase tracking-wide">
                          Archived
                        </span>
                      )}
                      <div className="text-sm text-gray-900 mt-1">{parcel.description}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {parcel.weight} kg {parcel.shippingCost && `• Shipping: $${parcel.shippingCost}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-brand-900">{parcel.customer?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{parcel.originWarehouse?.name || 'Unknown'}</span>
                        <span className="mx-1.5 text-gray-400">→</span>
                        <span className="font-medium">{parcel.destinationWarehouse?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${parcel.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            parcel.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                            parcel.status === 'returned' ? 'bg-red-100 text-red-800' : 
                            parcel.status === 'payment_under_review' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {parcel.status.replace(/_/g, ' ')}
                        </span>
                        
                        {parcel.status !== 'pending' && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            parcel.isCustomerConfirmed 
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {parcel.isCustomerConfirmed ? 'Confirmed by Customer' : 'Pending Confirmation'}
                          </span>
                        )}

                        {parcel.customerTrackingId && (
                          <div className="text-xs text-gray-500 mt-0.5 font-mono">Trk: {parcel.customerTrackingId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right space-x-3">

                      {parcel.status === 'payment_under_review' && (currentRole === 'company_admin' || currentRole === 'warehouse_staff') && (
                        <>
                          {parcel.paymentReceiptUrl && (
                            <a 
                              href={parcel.paymentReceiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              View Receipt
                            </a>
                          )}
                          <button
                            onClick={() => handleApprovePayment(parcel.id)}
                            className="text-green-600 hover:text-green-800 transition-colors font-medium px-2 py-1 rounded hover:bg-green-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPayment(parcel.id)}
                            className="text-red-500 hover:text-red-700 transition-colors font-medium px-2 py-1 rounded hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isCompleted ? (
                        <span className="text-xs text-gray-400 italic px-2 py-1">
                          No further action needed
                        </span>
                      ) : isEditable ? (
                        <button
                          onClick={() => handleOpenStatusModal(parcel)}
                          className="text-brand-500 hover:text-brand-900 transition-colors font-medium px-2 py-1 rounded hover:bg-brand-100/50"
                        >
                          Update Status
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-100 rounded cursor-not-allowed" title="Status updates are restricted to the Destination Warehouse after shipment">
                          Managed by Other Warehouse
                        </span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isStatusModalOpen && selectedParcel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm transition-opacity p-4"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div 
            className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-xl font-bold text-brand-900">Update Status & Details</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-brand-900">Parcel Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900 capitalize"
                >
                  {getAvailableStatusesForParcel(selectedParcel).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {newStatus === 'scanned' && (
                <div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
                  <h4 className="text-sm font-bold text-brand-900 border-b border-brand-200 pb-2">Data Capture & Image</h4>
                    <div>
                      <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">Parcel Name / Contents</label>
                      <input 
                        type="text" 
                        value={updateDescription} 
                        onChange={(e) => setUpdateDescription(e.target.value)} 
                        placeholder="e.g. iPhone 15 Pro Max, Sony Headphones"
                        required 
                        className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" 
                      />
                    </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">Actual Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={updateWeight} 
                        onChange={handleWeightChange} 
                        required 
                        className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">Shipping Cost ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={updateShippingCost} 
                        onChange={(e) => setUpdateShippingCost(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">Upload Parcel Image</label>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handleImageFileChange} 
                      required 
                      className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" 
                    />
                  </div>
                </div>
              )}
              
              {newStatus === 'shipped' && (
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-brand-900">Final Tracking ID (e.g., DHL/FedEx)</label>
                  <input 
                    type="text" 
                    value={customerTrackingId} 
                    onChange={(e) => setCustomerTrackingId(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 text-sm border rounded-lg border-brand-300 bg-brand-100/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900" 
                  />
                </div>
              )}

              <div className="flex justify-end pt-4 space-x-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsStatusModalOpen(false)} 
                  className="px-5 py-2 text-sm font-medium rounded-lg text-brand-900 bg-brand-100 hover:bg-brand-300 transition-colors duration-200" 
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-900 shadow-sm transition-colors duration-200" 
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Save Details'}
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