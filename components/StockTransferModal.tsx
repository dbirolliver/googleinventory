import React, { useState, useMemo } from 'react';
import type { InventoryItem, Branch } from '../types';

interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Staff';
  branchId?: string;
}

interface StockTransferModalProps {
  product: InventoryItem;
  branches: Branch[];
  onClose: () => void;
  onTransfer: (productId: string, fromBranchId: string, toBranchId: string, amount: number) => void;
  currentUser: User;
}

const StockTransferModal: React.FC<StockTransferModalProps> = ({ product, branches, onClose, onTransfer, currentUser }) => {
  const [fromBranchId, setFromBranchId] = useState(currentUser.role === 'Staff' ? currentUser.branchId || '' : '');
  const [toBranchId, setToBranchId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const availableQuantity = useMemo(() => {
    return product.stockLevels.find(sl => sl.branchId === fromBranchId)?.quantity || 0;
  }, [fromBranchId, product.stockLevels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const transferAmount = parseInt(amount, 10);
    if (!fromBranchId || !toBranchId || !transferAmount || transferAmount <= 0) {
      setError('Please fill all fields with valid values.');
      return;
    }
    if (fromBranchId === toBranchId) {
        setError('Cannot transfer to the same branch.');
        return;
    }
    if (transferAmount > availableQuantity) {
      setError(`Cannot transfer more than available stock (${availableQuantity}).`);
      return;
    }

    onTransfer(product.id, fromBranchId, toBranchId, transferAmount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Transfer Stock</h2>
        <p className="text-gray-400 mb-6">Product: {product.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fromBranch" className="block text-sm font-medium text-gray-300 mb-1">From Branch</label>
            <select 
                id="fromBranch" 
                value={fromBranchId} 
                onChange={e => setFromBranchId(e.target.value)} 
                className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition disabled:opacity-70 disabled:cursor-not-allowed" 
                required
                disabled={currentUser.role === 'Staff'}
            >
              <option value="">Select source</option>
              {branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-gray-800">
                      {b.name} (Available: {product.stockLevels.find(sl => sl.branchId === b.id)?.quantity || 0})
                  </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="toBranch" className="block text-sm font-medium text-gray-300 mb-1">To Branch</label>
            <select id="toBranch" value={toBranchId} onChange={e => setToBranchId(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required>
              <option value="">Select destination</option>
              {branches.map(b => <option key={b.id} value={b.id} className="bg-gray-800">{b.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
            <input id="quantity" type="number" value={amount} onChange={e => setAmount(e.target.value)} max={availableQuantity} min="1" placeholder="e.g. 25" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400" required />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex space-x-2 pt-4">
            <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
            <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Confirm Transfer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransferModal;