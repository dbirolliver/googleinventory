import React, { useState, useEffect } from 'react';
import type { Product, Supplier } from '../types';

interface EditProductModalProps {
  product: Product;
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, suppliers, onClose, onSave }) => {
  const [name, setName] = useState(product.name);
  const [supplierId, setSupplierId] = useState(product.supplierId);
  const [minStockLevel, setMinStockLevel] = useState(product.minStockLevel?.toString() || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedMinStock = parseInt(minStockLevel, 10);
    if (minStockLevel && (isNaN(parsedMinStock) || parsedMinStock < 0)) {
        setError('Minimum stock level must be a positive number.');
        return;
    }

    onSave({
      ...product,
      name,
      supplierId,
      minStockLevel: minStockLevel ? parsedMinStock : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editProductName" className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
            <input id="editProductName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
          </div>
          <div>
            <label htmlFor="editSupplier" className="block text-sm font-medium text-gray-300 mb-1">Supplier</label>
            <select id="editSupplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required>
              {suppliers.map(s => <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-300 mb-1">Minimum Stock Level</label>
            <input id="minStockLevel" type="number" value={minStockLevel} onChange={(e) => setMinStockLevel(e.target.value)} min="0" placeholder="e.g. 50" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" />
            <p className="text-xs text-gray-400 mt-1">Set a threshold for high-urgency alerts.</p>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex space-x-2 pt-4">
            <button type="button" onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
            <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
