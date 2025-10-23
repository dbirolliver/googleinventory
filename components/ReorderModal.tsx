
import React, { useState } from 'react';
import type { InventoryItem } from '../types';

interface ReorderModalProps {
  product: InventoryItem;
  onClose: () => void;
  onReorder: (productId: string, supplierId: string, quantity: number, orderName: string) => void;
}

const ReorderModal: React.FC<ReorderModalProps> = ({ product, onClose, onReorder }) => {
  const [quantity, setQuantity] = useState(product.predictedUsage?.toString() || '');
  const [orderName, setOrderName] = useState(`Reorder for ${product.name}`);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedQuantity = parseInt(quantity, 10);
    if (!orderName.trim() || !quantity.trim() || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError('Please provide a valid order reference and quantity.');
      return;
    }

    onReorder(product.id, product.supplierId, parsedQuantity, orderName);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">Prepare Reorder</h2>
        <p className="text-gray-400 mb-6">Product: {product.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orderName" className="block text-sm font-medium text-gray-300 mb-1">Order Reference / Name</label>
            <input 
              id="orderName" 
              type="text" 
              value={orderName} 
              onChange={e => setOrderName(e.target.value)} 
              className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" 
              required
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Quantity to Order</label>
            <input 
              id="quantity" 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              min="1" 
              placeholder={`Suggested: ${product.predictedUsage || 100}`} 
              className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400" 
              required 
            />
             <p className="text-xs text-gray-400 mt-1">AI suggests ordering {product.predictedUsage} units based on predicted usage.</p>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex space-x-2 pt-4">
            <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
            <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Place Reorder</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReorderModal;
