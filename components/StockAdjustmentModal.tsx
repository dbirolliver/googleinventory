

import React, { useState, useMemo } from 'react';
import type { InventoryItem, Branch, User, StockBatch } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StockAdjustmentModalProps {
  product: InventoryItem;
  branches: Branch[];
  onClose: () => void;
  onBatchesUpdate: (productId: string, branchId: string, newBatches: StockBatch[], reason: string) => void;
  currentUser: User;
}

const AUDIT_REASONS_RECEIVE = [
    'Received from supplier',
    'Stock transfer received',
    'Cycle count correction (found stock)',
    'Other (specify below)'
];

const AUDIT_REASONS_USE = [
    'Dispensed for procedure',
    'Damaged or unusable',
    'Expired stock removal',
    'Stock transfer sent',
    'Cycle count correction (lost stock)',
    'Other (specify below)'
];

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ product, branches, onClose, onBatchesUpdate, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'receive' | 'use'>('receive');
  const [selectedBranchId, setSelectedBranchId] = useState(currentUser.role === 'Staff' ? currentUser.branchId || '' : '');
  const [error, setError] = useState('');

  // State for Receive tab
  const [receiveQuantity, setReceiveQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [receiveReason, setReceiveReason] = useState(AUDIT_REASONS_RECEIVE[0]);
  const [customReceiveReason, setCustomReceiveReason] = useState('');
  
  // State for Use tab
  const [useQuantity, setUseQuantity] = useState('');
  const [useReason, setUseReason] = useState(AUDIT_REASONS_USE[0]);
  const [customUseReason, setCustomUseReason] = useState('');

  const currentStockLevel = useMemo(() => {
    return product.stockLevels.find(sl => sl.branchId === selectedBranchId);
  }, [product, selectedBranchId]);
  
  const currentBatches = useMemo(() => {
      return currentStockLevel?.batches || [];
  }, [currentStockLevel]);

  const totalStockAtBranch = useMemo(() => {
    return currentBatches.reduce((sum, batch) => sum + batch.quantity, 0);
  }, [currentBatches]);

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const quantity = parseInt(receiveQuantity, 10);
    if (!selectedBranchId || isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }
    const finalReason = receiveReason === 'Other (specify below)' ? customReceiveReason.trim() : receiveReason;
    if (!finalReason) {
        setError('Please provide a reason for this auditable action.');
        return;
    }

    const newBatch: StockBatch = {
      batchId: uuidv4(),
      quantity,
      expiryDate: expiryDate || undefined,
      dateReceived: new Date().toISOString().split('T')[0],
    };
    
    // Check if an identical batch exists to merge with
    const existingBatchIndex = currentBatches.findIndex(b => b.expiryDate === newBatch.expiryDate && b.dateReceived === newBatch.dateReceived);
    let updatedBatches;
    if (existingBatchIndex > -1) {
        updatedBatches = [...currentBatches];
        updatedBatches[existingBatchIndex].quantity += newBatch.quantity;
    } else {
        updatedBatches = [...currentBatches, newBatch];
    }
    
    onBatchesUpdate(product.id, selectedBranchId, updatedBatches, `${finalReason} (+${quantity})`);
  };
  
  const handleUseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const quantityToUse = parseInt(useQuantity, 10);
    if (!selectedBranchId || isNaN(quantityToUse) || quantityToUse <= 0) {
      setError('Please enter a valid positive quantity to use.');
      return;
    }
     if (quantityToUse > totalStockAtBranch) {
      setError(`Cannot use more than available stock (${totalStockAtBranch}).`);
      return;
    }
    const finalReason = useReason === 'Other (specify below)' ? customUseReason.trim() : useReason;
    if (!finalReason) {
        setError('Please provide a reason for this auditable action.');
        return;
    }

    // FEFO Logic: First-Expired, First-Out
    const sortedBatches = [...currentBatches].sort((a, b) => {
        if (a.expiryDate && b.expiryDate) return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        if (a.expiryDate) return -1; // Batches with expiry dates come first
        if (b.expiryDate) return 1;
        return new Date(a.dateReceived).getTime() - new Date(b.dateReceived).getTime(); // Fallback to oldest received
    });

    let remainingToUse = quantityToUse;
    const newBatches = sortedBatches.map(batch => {
        if (remainingToUse <= 0) return batch;
        
        const amountToTake = Math.min(remainingToUse, batch.quantity);
        remainingToUse -= amountToTake;
        
        return { ...batch, quantity: batch.quantity - amountToTake };
    }).filter(batch => batch.quantity > 0); // Remove depleted batches

    onBatchesUpdate(product.id, selectedBranchId, newBatches, `${finalReason} (-${quantityToUse})`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Update Stock / Track Usage</h2>
        <p className="text-gray-400 mb-4">Product: {product.name}</p>

        <div className="mb-4">
            <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">Clinic Location</label>
            <select 
              id="branch" 
              value={selectedBranchId} 
              onChange={e => {setSelectedBranchId(e.target.value); setError('');}} 
              className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition disabled:opacity-70 disabled:cursor-not-allowed" 
              required
              disabled={currentUser.role === 'Staff'}
            >
              <option value="">Select clinic</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-gray-800">{b.name}</option>
              ))}
            </select>
        </div>

        {selectedBranchId && (
          <>
            <div className="flex border-b border-white/20 mb-4">
                <button onClick={() => setActiveTab('receive')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'receive' ? 'text-blue-300 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>Receive Stock</button>
                <button onClick={() => setActiveTab('use')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'use' ? 'text-blue-300 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>Use/Dispense Stock</button>
            </div>
            
            {activeTab === 'receive' && (
              <form onSubmit={handleReceiveSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="receiveQuantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity Received</label>
                    <input id="receiveQuantity" type="number" value={receiveQuantity} onChange={e => setReceiveQuantity(e.target.value)} min="1" placeholder="e.g. 50" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
                 </div>
                 <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">Expiry Date (Optional)</label>
                    <input id="expiryDate" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" />
                 </div>
                 <div>
                    <label htmlFor="receiveReason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Adjustment</label>
                    <select id="receiveReason" value={receiveReason} onChange={e => setReceiveReason(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required>
                        {AUDIT_REASONS_RECEIVE.map(r => <option key={r} value={r} className="bg-gray-800">{r}</option>)}
                    </select>
                 </div>
                 {receiveReason === 'Other (specify below)' && (
                    <input type="text" value={customReceiveReason} onChange={e => setCustomReceiveReason(e.target.value)} placeholder="Please specify reason" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
                 )}
                 <div className="flex space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
                    <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Add Batch</button>
                 </div>
              </form>
            )}

            {activeTab === 'use' && (
              <form onSubmit={handleUseSubmit} className="space-y-4">
                 <div>
                    <p className="text-sm text-gray-400">Total Available Stock: <span className="font-bold text-gray-200">{totalStockAtBranch}</span></p>
                 </div>
                 <div>
                    <label htmlFor="useQuantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity to Use/Dispense</label>
                    <input id="useQuantity" type="number" value={useQuantity} onChange={e => setUseQuantity(e.target.value)} min="1" max={totalStockAtBranch} placeholder="e.g. 5" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
                 </div>
                  <div>
                    <label htmlFor="useReason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Adjustment</label>
                    <select id="useReason" value={useReason} onChange={e => setUseReason(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required>
                        {AUDIT_REASONS_USE.map(r => <option key={r} value={r} className="bg-gray-800">{r}</option>)}
                    </select>
                 </div>
                 {useReason === 'Other (specify below)' && (
                    <input type="text" value={customUseReason} onChange={e => setCustomUseReason(e.target.value)} placeholder="Please specify reason" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
                 )}
                 <div className="flex space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
                    <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Confirm Usage</button>
                 </div>
              </form>
            )}
            
            {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default StockAdjustmentModal;