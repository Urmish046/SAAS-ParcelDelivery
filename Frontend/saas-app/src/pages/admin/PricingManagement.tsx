import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useUi } from '../../context/UiContext';

export const PricingManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { showToast } = useUi();
  const [tiers, setTiers] = useState<any[]>([]);

  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchTiers = async () => {
    try {
      const res = await fetch(`${apiUrl}/pricing/tiers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTiers(data);
    } catch (error) {
      showToast('Failed to load pricing tiers', 'error');
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minWeight || !pricePerKg) return;

    try {
      const res = await fetch(`${apiUrl}/pricing/tiers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          minWeight: parseFloat(minWeight),
          maxWeight: maxWeight ? parseFloat(maxWeight) : null,
          pricePerKg: parseFloat(pricePerKg)
        })
      });

      if (res.ok) {
        showToast('Pricing tier added successfully!', 'success');
        setMinWeight('');
        setMaxWeight('');
        setPricePerKg('');
        fetchTiers();
      } else {
        showToast('Failed to add tier', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-brand-900">Shipment Pricing Tiers</h2>
        <p className="text-sm text-gray-500 mt-1">Set up automated shipping rates based on parcel weight.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-brand-200 shadow-sm">
        <h3 className="text-lg font-bold text-brand-900 mb-4">Add New Tier</h3>
        <form onSubmit={handleAddTier} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">Min Wt. (kg)</label>
            <input type="number" step="0.01" required value={minWeight} onChange={e => setMinWeight(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50" placeholder="e.g. 0" />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">Max Wt. (kg)</label>
            <input type="number" step="0.01" value={maxWeight} onChange={e => setMaxWeight(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50" placeholder="Leave empty for infinity" />
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">Rate Per Kg ($)</label>
            <input type="number" step="0.01" required value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50" placeholder="e.g. 15.50" />
          </div>
          <button type="submit" className="w-full px-4 py-2.5 text-sm font-bold text-white bg-brand-500 hover:bg-brand-900 rounded-lg shadow-sm transition-colors">
            Add Tier
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-brand-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-900">Tier Range</th>
              <th className="px-6 py-3 font-semibold text-gray-900 text-right">Rate Per Kg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tiers.length === 0 ? (
              <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-400">No pricing tiers defined yet. The default fallback rate is $10/kg.</td></tr>
            ) : (
              tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-brand-900">
                    {tier.minWeight} kg {tier.maxWeight ? ` to ${tier.maxWeight} kg` : ' and above'}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-green-700">
                    ${Number(tier.pricePerKg).toFixed(2)} / kg
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};