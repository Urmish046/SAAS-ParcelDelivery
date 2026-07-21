import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const AddTrackingNumberForm: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { data } = await api.get('/warehouses');
        setWarehouses(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/parcels/pre-alert', {
        originalTrackingNumber: trackingNumber,
        destinationWarehouseId,
      });
      setTrackingNumber('');
      setDestinationWarehouseId('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Add Expected Parcel</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">AliExpress / Supplier Tracking Number</label>
        <input
          type="text"
          required
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Destination Warehouse (Your Country)</label>
        <select
          required
          value={destinationWarehouseId}
          onChange={(e) => setDestinationWarehouseId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="" disabled>Select a warehouse</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>{wh.name} - {wh.city}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full bg-brand-600 text-white font-bold py-2 px-4 rounded hover:bg-brand-700">
        Add Parcel
      </button>
    </form>
  );
};

export default AddTrackingNumberForm;