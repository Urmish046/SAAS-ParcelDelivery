import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { claimParcel } from '../../features/parcels/parcelsSlice';

const AddParcel: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const dispatch = useDispatch<any>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      // Naya Redux action call kar rahe hain
      await dispatch(claimParcel(trackingNumber)).unwrap();
      
      setStatusMsg({ 
        type: 'success', 
        text: 'Parcel added to your tracking list successfully!' 
      });
      setTrackingNumber('');
    } catch (error: any) {
      setStatusMsg({ 
        type: 'error', 
        text: error || 'Failed to track parcel. Invalid ID or already claimed.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-12">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-widest text-brand-900 mb-2">
          Track a Parcel
        </h1>
        <p className="text-xs md:text-sm font-semibold tracking-wider text-gray-500 uppercase">
          Enter the tracking ID provided by the warehouse to monitor your shipment.
        </p>
      </div>

      {statusMsg.text && (
        <div className={`w-full max-w-4xl p-4 mb-8 text-sm font-bold uppercase tracking-wider text-white ${statusMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6 md:space-y-8">
        <div>
          <label className="block mb-2 text-xs md:text-sm font-bold tracking-wider text-brand-900 uppercase">
            Tracking Number
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. PK1234567890"
            required
            className="w-full px-4 py-4 bg-gray-50 border border-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-brand-900 text-base"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto md:min-w-[250px] px-8 py-4 text-sm md:text-base font-bold tracking-widest text-white uppercase transition-colors bg-brand-900 hover:bg-brand-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span>Searching...</span>
              </>
            ) : (
              <span>Add to Dashboard</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParcel;