import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axiosConfig';
import { fetchParcels, claimParcel } from '../../features/parcels/parcelsSlice';

const CustomerDashboard: React.FC = () => {
  const [stats, setStats] = useState({ activeShipments: 0, actionRequired: 0, readyForPickup: 0 });
  
  // Naya initial loading state, taake page bar bar blink na kare background updates pe
  const [initialLoading, setInitialLoading] = useState(true);

  // Add-tracking form state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState({ type: '', text: '' });

  // Image preview modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Payment upload modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentParcelId, setPaymentParcelId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  const dispatch = useDispatch<any>();
  const { parcelsList } = useSelector((state: any) => state.parcels);

  const fetchAllData = async () => {
    try {
      api.get('/parcels/customer/stats').then(({ data }) => setStats(data)).catch(console.error);
      await dispatch(fetchParcels()).unwrap();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchAllData().finally(() => {
      setInitialLoading(false);
    });

    const intervalId = setInterval(() => {
      fetchAllData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (selectedImage) setImgError(false);
  }, [selectedImage]);

  const activeParcels = parcelsList.filter((p: any) => 
    !['completed', 'returned'].includes(p.status.toLowerCase())
  );

 const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    const alreadyExists = parcelsList.find((p: any) => 
      p.originalTrackingNumber === trackingNumber || 
      p.customerTrackingId === trackingNumber || 
      p.internalTrackingId === trackingNumber
    );

    if (alreadyExists) {
      const pStatus = alreadyExists.status.toLowerCase();
      if (['completed', 'returned'].includes(pStatus)) {
        setClaimMsg({ type: 'error', text: 'This tracking ID is already in your History.' });
      } else {
        setClaimMsg({ type: 'error', text: 'This tracking ID is already in your Active Shipments.' });
      }
      return;
    }

    setClaiming(true);
    setClaimMsg({ type: '', text: '' });

    try {
      await dispatch(claimParcel(trackingNumber)).unwrap();
      setClaimMsg({ type: 'success', text: 'Parcel linked to your account!' });
      setTrackingNumber('');
      
      fetchAllData();
    } catch (error: any) {
         setClaimMsg({ type: 'error', text: error || 'Failed to claim parcel. Invalid ID or already claimed.' });      
      setClaimMsg({
        type: 'error',
        text: 'No parcel found with this Tracking ID in our system.' 
      });
      
    } finally {
      setClaiming(false);
    }
  };
  const handleConfirmShipment = async (parcelId: string) => {
    if (!window.confirm("Are you sure you want to confirm this shipment for dispatch?")) return;
    try {
      await api.patch(`/parcels/${parcelId}/confirm`);
      fetchAllData();
    } catch (error) {
      console.error("Failed to confirm shipment", error);
      alert("Failed to confirm shipment. Please try again.");
    }
  };

  const handleOpenPaymentModal = (parcelId: string) => {
    setPaymentParcelId(parcelId);
    setReceiptFile(null);
    setIsPaymentModalOpen(true);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentParcelId || !receiptFile) {
      alert("Please select a receipt file to upload.");
      return;
    }

    setIsUploadingPayment(true);
    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      await api.post(`/parcels/${paymentParcelId}/upload-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert("Payment receipt uploaded successfully! Your parcel is now Completed.");
      setIsPaymentModalOpen(false);
      setPaymentParcelId(null);
      setReceiptFile(null);
      fetchAllData();
    } catch (err: any) {
      console.error("Payment Upload Error:", err);
      alert(`Failed to upload payment: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const getStatusBadge = (parcelStatus: string) => {
    switch (parcelStatus.toLowerCase()) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">Expected</span>;
      case 'scanned':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Warehouse Received</span>;
      case 'shipped':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">In Transit</span>;
      case 'available_for_pickup':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">Ready for Pickup</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 capitalize">{parcelStatus.replace(/_/g, ' ')}</span>;
    }
  };

  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `http://localhost:9000/${cleanUrl}`;
  };

  const handleViewImage = (parcel: any) => {
    if (parcel.imageUrls && parcel.imageUrls.length > 0) {
      setSelectedImage(getFullImageUrl(parcel.imageUrls[0]));
    }
  };

  // Ab sirf page pehli bar load hone par loader aayega
  if (initialLoading) {
    return (
      <div className="w-full pb-12 animate-pulse">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="h-8 bg-gray-200 rounded-md w-48 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded-md w-64"></div>
        </div>
        <div className="h-24 bg-gray-50 rounded-xl border border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 relative">

      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-500">
          Track your shipments and pending actions at a glance. Updates automatically.
        </p>
      </div>

      {/* Add Tracking Number */}
      <div className="mb-10 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wide mb-3">
          Track a New Parcel
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Enter the tracking ID given by the warehouse to link it to your account.
        </p>

        {claimMsg.text && (
          <div className={`p-3 mb-4 text-xs font-bold uppercase tracking-wider text-white rounded ${claimMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {claimMsg.text}
          </div>
        )}

        <form onSubmit={handleClaim} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. PK1234567890"
            required
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-brand-900 text-sm"
          />
          <button
            type="submit"
            disabled={claiming}
            className="px-6 py-3 text-sm font-bold tracking-widest text-white uppercase transition-colors bg-brand-900 hover:bg-brand-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {claiming ? 'Linking...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Stats — table */}
      <div className="mb-12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Shipments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Required</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ready for Pickup</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-5">
                <span className="text-2xl font-bold text-blue-600">{stats.activeShipments}</span>
              </td>
              <td className="px-6 py-5">
                <span className="text-2xl font-bold text-amber-500 mr-3">{stats.actionRequired}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 uppercase align-middle">
                  Pending Confirmation
                </span>
              </td>
              <td className="px-6 py-5">
                <span className="text-2xl font-bold text-green-600 mr-3">{stats.readyForPickup}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-green-50 text-green-700 border border-green-200 uppercase align-middle">
                  At Destination Warehouse
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Jab tak active shipments 0 rahengi table hide rahega, ek dafa ID add ho jaye toh always show hoga */}
      {activeParcels.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brand-900 mb-4">Active Shipments</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description & Media</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeParcels.map((parcel: any) => (
                    <tr key={parcel.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-900">{parcel.originalTrackingNumber || parcel.customerTrackingId || 'N/A'}</div>
                        <div className="text-xs font-medium text-gray-400 mt-0.5 font-mono">
                          {parcel.internalTrackingId || 'Awaiting System ID'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">{parcel.description || '—'}</div>
                        {parcel.imageUrls && parcel.imageUrls.length > 0 && (
                          <button
                            onClick={() => handleViewImage(parcel)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-900 transition-colors bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded-md border border-brand-200"
                          >
                            <span>📷</span> View Image
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {/* Status automatically change ho jayega yahan background hit se */}
                        {getStatusBadge(parcel.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {parcel.shippingCost ? `$${parcel.shippingCost}` : 'Pending'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        {parcel.status.toLowerCase() === 'scanned' && (
                          <button
                            onClick={() => handleConfirmShipment(parcel.id)}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-all"
                          >
                            Confirm
                          </button>
                        )}

                        {parcel.status.toLowerCase() === 'available_for_pickup' && (
                          <button
                            onClick={() => handleOpenPaymentModal(parcel.id)}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all"
                          >
                            Pay Now
                          </button>
                        )}

                        {!['scanned', 'available_for_pickup'].includes(parcel.status.toLowerCase()) && (
                          <span className="text-xs font-medium text-gray-400 italic cursor-default">
                            No action needed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/80 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-brand-900">Parcel Image</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-4 flex justify-center items-center bg-gray-100 min-h-[300px]">
              {imgError ? (
                <div className="flex flex-col items-center text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="font-semibold text-sm">Image could not be loaded</p>
                </div>
              ) : (
                <img
                  src={selectedImage}
                  alt="Parcel"
                  className="max-h-[70vh] object-contain rounded shadow-sm"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment upload modal */}
      {isPaymentModalOpen && paymentParcelId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/80 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="w-full max-w-md p-7 bg-white shadow-2xl rounded-2xl border border-brand-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-900">Upload Payment Receipt</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadPayment} className="space-y-5">
              <div className="p-4 bg-brand-50 rounded-lg border border-brand-200">
                <p className="text-sm text-brand-800 mb-3 font-medium">
                  Please upload a screenshot or PDF of your payment transaction.
                </p>
                <label className="block mb-1.5 text-xs font-bold text-brand-900 uppercase">
                  Select Receipt File
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp, application/pdf"
                  onChange={handleReceiptFileChange}
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg border-brand-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-brand-900"
                />
              </div>

              <div className="flex justify-end pt-2 space-x-3 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg text-brand-900 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  disabled={isUploadingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 shadow-sm transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isUploadingPayment || !receiptFile}
                >
                  {isUploadingPayment ? 'Uploading...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;