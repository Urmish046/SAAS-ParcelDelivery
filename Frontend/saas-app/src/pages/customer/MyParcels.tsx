import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

interface Parcel {
  id: string;
  internalTrackingId: string;
  originalTrackingNumber: string;
  status: string;
  description: string;
  shippingCost: number | null;
  createdAt: string;
  imageUrls?: string[]; 
}

const MyParcels: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false); 

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentParcelId, setPaymentParcelId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  const fetchMyParcels = async () => {
    try {
      const { data } = await api.get('/parcels/my-parcels');
      
      // ✨ NEW: Filter out active parcels. Only keep 'completed' or 'returned'
      const historyParcels = data.filter((parcel: Parcel) => 
        ['completed', 'returned'].includes(parcel.status.toLowerCase())
      );
      
      setParcels(historyParcels);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyParcels();
  }, []);

  useEffect(() => {
    if (selectedImage) {
      setImgError(false);
      console.log("📸 BROWSER IS TRYING TO LOAD THIS URL:", selectedImage); 
    }
  }, [selectedImage]);

  const handleConfirmShipment = async (parcelId: string) => {
    if (!window.confirm("Are you sure you want to confirm this shipment for dispatch?")) return;
    
    try {
      await api.patch(`/parcels/${parcelId}/confirm`);
      fetchMyParcels(); 
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
      fetchMyParcels(); 
    } catch (err: any) {
      console.error("Payment Upload Error:", err);
      alert(`Failed to upload payment: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">Expected</span>;
      case 'scanned': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Warehouse Received</span>;
      case 'shipped': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">In Transit</span>;
      case 'available_for_pickup': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">Ready for Pickup</span>;
      case 'completed': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-900 border border-brand-200">Completed</span>;
      case 'returned': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Returned</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 capitalize">{status.replace(/_/g, ' ')}</span>;
    }
  };

  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `http://localhost:9000/${cleanUrl}`;
  };

  return (
    <div className="w-full pb-12 relative">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-900 mb-2">Shipment History</h1>
        <p className="text-sm font-medium text-gray-500">Track and manage your old imported parcels.</p>
      </div>
      
      {error && (
        <div className="p-4 mb-6 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="w-full animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl w-full"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description & Media</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parcels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-sm text-center text-gray-500">
                      No past shipments found. Your completed or returned parcels will appear here.
                    </td>
                  </tr>
                ) : (
                  parcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-900">{parcel.originalTrackingNumber || 'N/A'}</div>
                        <div className="text-xs font-medium text-gray-400 mt-0.5 font-mono">
                          {parcel.internalTrackingId ? parcel.internalTrackingId : 'Awaiting System ID'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-600">{parcel.description || '—'}</div>
                        
                        {parcel.imageUrls && parcel.imageUrls.length > 0 && (
                          <button 
                            onClick={() => setSelectedImage(getFullImageUrl(parcel.imageUrls![0]))}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-900 transition-colors bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded-md border border-brand-200"
                          >
                            <span>📷</span> View Image
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(parcel.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(parcel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <span className="text-xs font-medium text-gray-400 italic cursor-default">
                          No action needed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/80 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setSelectedImage(null)} 
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
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
    </div>
  );
};

export default MyParcels;