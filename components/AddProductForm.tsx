

import React, { useState } from 'react';
import type { Product, Supplier, Branch, StockLevel, User } from '../types';

interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id' | 'historicalSales' | 'historicalPrices'> & { stockLevels: StockLevel[] }) => void;
  suppliers: Supplier[];
  branches: Branch[];
  currentUser: User;
}

interface StockInput {
    quantity: string;
    expiryDate: string;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, suppliers, branches, currentUser }) => {
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

    const finalStockLevels: StockLevel[] = branches.map(branch => ({
      branchId: branch.id,
      quantity: Number(stockLevels[branch.id]?.quantity || 0),
      expiryDate: stockLevels[branch.id]?.expiryDate || undefined
    }));
    
    const parsedMinStock = minStockLevel ? parseInt(minStockLevel, 10) : undefined;
    const parsedPurchasePrice = parseFloat(purchasePrice);

    onAddProduct({ name, supplierId, stockLevels: finalStockLevels, minStockLevel: parsedMinStock, purchasePrice: parsedPurchasePrice });

    // Reset form
    setName('');
    setSupplierId(suppliers[0]?.id || '');
    setStockLevels({});
    setMinStockLevel('');
    setPurchasePrice('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
          <input id="productName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bamboo Toothbrush" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400" required />
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
              placeholder="e.g. 5.99" 
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
              placeholder="e.g. 50" 
              className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-400" 
            />
          </div>
        </div>
        <div>
            <p className="block text-sm font-medium text-gray-300 mb-1">Initial Stock & Expiry</p>
            <div className="space-y-3">
                {branchesForUser.map(branch => (
                    <div key={branch.id} className="grid grid-cols-5 gap-2 items-center">
                         <label htmlFor={`stock-${branch.id}`} className="text-sm text-gray-400 col-span-2">{branch.name}</label>
                         <input id={`stock-${branch.id}`} type="number" value={stockLevels[branch.id]?.quantity || ''} onChange={(e) => handleStockChange(branch.id, 'quantity', e.target.value)} placeholder="Qty" min="0" className="w-full px-3 py-1 bg-black/20 text-white border border-white/30 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-500 col-span-1" required/>
                         <input id={`expiry-${branch.id}`} type="date" value={stockLevels[branch.id]?.expiryDate || ''} onChange={(e) => handleStockChange(branch.id, 'expiryDate', e.target.value)} className="w-full px-3 py-1 bg-black/20 text-white border border-white/30 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-gray-500 col-span-2" required/>
                    </div>
                ))}
            </div>
        </div>
        <button type="submit" className="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-lg border border-white/30 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
