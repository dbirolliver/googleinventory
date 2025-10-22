import React, { useState, useEffect } from 'react';
import type { InventoryItem, Branch } from '../types';

interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Staff';
  branchId?: string;
}

interface StockAdjustmentModalProps {
  product: InventoryItem;
  branches: Branch[];
  onClose: () => void;
  onAdjust: (productId: string, branchId: string, newQuantity: number, reason: string) => void;
  currentUser: User;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ product, branches, onClose, onAdjust, currentUser }) => {
  const [selectedBranchId, setSelectedBranchId] = useState(currentUser.role === 'Staff' ? currentUser.branchId || '' : '');
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const currentQuantity = product.stockLevels.find(sl => sl.branchId === selectedBranchId)?.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const quantity = parseInt(newQuantity, 10);
    if (!selectedBranchId || newQuantity === '' || isNaN(quantity) || quantity < 0) {
      setError('Please select a branch and enter a valid quantity.');
      return;
    }
    if (!reason.trim()) {
        setError('Please provide a reason for the adjustment.');
        return;
    }

    onAdjust(product.id, selectedBranchId, quantity, reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Adjust Stock</h2>
        <p className="text-gray-400 mb-6">Product: {product.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
            <select 
              id="branch" 
              value={selectedBranchId} 
              onChange={e => {setSelectedBranchId(e.target.value); setNewQuantity('');}} 
              className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition disabled:opacity-70 disabled:cursor-not-allowed" 
              required
              disabled={currentUser.role === 'Staff'}
            >
              <option value="">Select branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-gray-800">{b.name}</option>
              ))}
            </select>
          </div>

          {selectedBranchId && (
            <>
              <div>
                  <p className="text-sm text-gray-400">Current Stock: <span className="font-bold text-gray-200">{currentQuantity}</span></p>
              </div>
              <div>
                <label htmlFor="newQuantity" className="block text-sm font-medium text-gray-300 mb-1">New Quantity</label>
                <input id="newQuantity" type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} min="0" placeholder="e.g. 120" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400" required />
              </div>
               <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Adjustment</label>
                <input id="reason" type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Stock count correction" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400" required />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex space-x-2 pt-4">
            <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
            <button type="submit" disabled={!selectedBranchId} className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition disabled:opacity-50 disabled:cursor-not-allowed">Confirm Adjustment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;