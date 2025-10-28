

import React, { useState } from 'react';
// FIX: Import StockBatch type for creating new batches
import type { Product, Supplier, Branch, StockLevel, User, StockBatch } from '../types';
// FIX: Import uuid to generate unique batch IDs
import { v4 as uuidv4 } from 'uuid';

interface AddProductModalProps {
  onAddProduct: (product: Omit<Product, 'id' | 'historicalUsage' | 'historicalPrices'> & { stockLevels: StockLevel[] }) => void;
  onClose: () => void;
  suppliers: Supplier[];
  branches: Branch[];
  currentUser: User;
}

interface StockInput {
    quantity: string;
    expiryDate: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onAddProduct, onClose, suppliers, branches, currentUser }) => {
  const [name, setName] = useState('');
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [stockLevels, setStockLevels] = useState<Record<string, StockInput>>({});

  const branchesForUser = currentUser.role === 'Admin'
    ? branches
    : branches.filter(b => b.id === currentUser.branchId);

  const handleStockChange = (branchId: string, field: 'quantity' | 'expiryDate', value: string) => {
    setStockLevels(prev => ({
        ...prev,
        [branchId]: {
            ...prev[branchId],
            [field]: value
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !supplierId || !purchasePrice) return;

    // FIX: The `finalStockLevels` object was not being created with the correct shape.
    // It was missing the `batches` array required by the `StockLevel` type. This
    // creates a new batch for each clinic that has an initial quantity specified.
    const finalStockLevels: StockLevel[] = branches.map(branch => {
      const stockInput = stockLevels[branch.id];
      const quantity = Number(stockInput?.quantity || 0);

      if (quantity > 0) {
        const newBatch: StockBatch = {
          batchId: uuidv4(),
          quantity: quantity,
          expiryDate: stockInput.expiryDate || undefined,
          dateReceived: new Date().toISOString().split('T')[0],
        };
        return {
          branchId: branch.id,
          batches: [newBatch],
        };
      }

      return {
        branchId: branch.id,
        batches: [],
      };
    });
    
    const parsedMinStock = minStockLevel ? parseInt(minStockLevel, 10) : undefined;
    const parsedPurchasePrice = parseFloat(purchasePrice);

    onAddProduct({ name, supplierId, stockLevels: finalStockLevels, minStockLevel: parsedMinStock, purchasePrice: parsedPurchasePrice });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">Add New Supply</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">Supply Name</label>
                <input id="productName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nitrile Gloves (Box)" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400" required />
                </div>
                <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-300 mb-1">Supplier</label>
                <select id="supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
                    <option value="" disabled>Select a supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>)}
                </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300 mb-1">Cost per Unit</label>
                    <input 
                    id="purchasePrice" 
                    type="number" 
                    value={purchasePrice} 
                    onChange={(e) => setPurchasePrice(e.target.value)} 
                    min="0"
                    step="0.01"
                    placeholder="e.g. 15.99" 
                    className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400" 
                    required
                    />
                </div>
                <div>
                    <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-300 mb-1">Min Stock Level</label>
                    <input 
                    id="minStockLevel" 
                    type="number" 
                    value={minStockLevel} 
                    onChange={(e) => setMinStockLevel(e.target.value)} 
                    min="0"
                    placeholder="e.g. 10" 
                    className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400" 
                    />
                </div>
                </div>
                <div>
                    <p className="block text-sm font-medium text-gray-300 mb-1">Initial Stock & Expiry per Clinic</p>
                    <div className="space-y-3">
                        {branchesForUser.map(branch => (
                            <div key={branch.id} className="grid grid-cols-5 gap-2 items-center">
                                <label htmlFor={`stock-${branch.id}`} className="text-sm text-gray-400 col-span-2 truncate" title={branch.name}>{branch.name}</label>
                                <input id={`stock-${branch.id}`} type="number" value={stockLevels[branch.id]?.quantity || ''} onChange={(e) => handleStockChange(branch.id, 'quantity', e.target.value)} placeholder="Qty" min="0" className="w-full px-3 py-1 bg-black/20 text-white border border-white/30 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-500 col-span-1" />
                                <input id={`expiry-${branch.id}`} type="date" value={stockLevels[branch.id]?.expiryDate || ''} onChange={(e) => handleStockChange(branch.id, 'expiryDate', e.target.value)} className="w-full px-3 py-1 bg-black/20 text-white border border-white/30 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-500 col-span-2"/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
                    <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Add Supply</button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AddProductModal;