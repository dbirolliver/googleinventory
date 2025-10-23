

import React, { useState, useEffect, useMemo } from 'react';
import type { Supplier, User, InventoryItem } from '../types';
import UrgencyPill from './UrgencyPill';

interface SupplierManagerProps {
  suppliers: Supplier[];
  inventory: InventoryItem[];
  onAddSupplier: (name: string, contactEmail: string) => void;
  onEditSupplier: (id: string, name: string, contactEmail: string) => void;
  onDeleteSupplier: (id: string) => void;
  onToggleQuickReorder: (id: string, enabled: boolean) => void;
  onPrepareReorder: (product: InventoryItem) => void;
  currentUser: User;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

const SupplierManager: React.FC<SupplierManagerProps> = ({ 
    suppliers, inventory, onAddSupplier, onEditSupplier, onDeleteSupplier, 
    onToggleQuickReorder, onPrepareReorder, currentUser 
}) => {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'Admin';

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name);
      setContactEmail(editingSupplier.contactEmail);
    } else {
      setName('');
      setContactEmail('');
    }
  }, [editingSupplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactEmail.trim()) return;

    if (editingSupplier) {
      onEditSupplier(editingSupplier.id, name, contactEmail);
    } else {
      onAddSupplier(name, contactEmail);
    }
    setEditingSupplier(null);
  };
  
  const handleCancel = () => {
    setEditingSupplier(null);
  };

  const handleToggleExpand = (supplierId: string) => {
    setExpandedSupplierId(prevId => (prevId === supplierId ? null : supplierId));
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-200">Supplier & Product Management</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400"
            />
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => {
                const supplierProducts = inventory.filter(p => p.supplierId === supplier.id);
                const isExpanded = expandedSupplierId === supplier.id;
                return (
                    <div key={supplier.id} className="bg-black/20 rounded-lg border border-white/20 transition-all">
                        <div 
                            className="flex items-center p-4 cursor-pointer hover:bg-white/5"
                            onClick={() => handleToggleExpand(supplier.id)}
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-100 truncate" title={supplier.name}>{supplier.name}</h3>
                                <p className="text-sm text-gray-400 truncate" title={supplier.contactEmail}>{supplier.contactEmail}</p>
                            </div>
                            <div className="flex items-center space-x-4 pl-4 shrink-0">
                                {isAdmin && (
                                    <div className="hidden lg:flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                        <span className="text-xs text-gray-300">Quick Reorder</span>
                                        <div title="Enable a 'Prepare Reorder' button on AI suggestion cards for products from this supplier.">
                                            <ToggleSwitch checked={supplier.quickReorderEnabled} onChange={(enabled) => onToggleQuickReorder(supplier.id, enabled)} />
                                        </div>
                                    </div>
                                )}
                                <div onClick={e => e.stopPropagation()} className="flex items-center space-x-4">
                                    <button onClick={() => setEditingSupplier(supplier)} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Edit</button>
                                    <button onClick={() => onDeleteSupplier(supplier.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="p-4 border-t border-white/10 bg-black/10">
                                <h4 className="text-md font-semibold text-gray-200 mb-3">Associated Products ({supplierProducts.length})</h4>
                                {supplierProducts.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[400px]">
                                            <thead className="border-b border-white/20">
                                                <tr>
                                                    <th className="py-2 px-3 text-xs font-semibold text-gray-400 uppercase">Product</th>
                                                    <th className="py-2 px-3 text-xs font-semibold text-gray-400 uppercase text-center">Stock</th>
                                                    <th className="py-2 px-3 text-xs font-semibold text-gray-400 uppercase text-center">Urgency</th>
                                                    <th className="py-2 px-3 text-xs font-semibold text-gray-400 uppercase text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {supplierProducts.map(product => (
                                                    <tr key={product.id}>
                                                        <td className="py-2 px-3 text-sm text-gray-200 truncate" title={product.name}>{product.name}</td>
                                                        <td className="py-2 px-3 text-sm text-gray-200 text-center">{product.totalStock}</td>
                                                        <td className="py-2 px-3 text-sm text-center"><UrgencyPill urgency={product.urgency} /></td>
                                                        <td className="py-2 px-3 text-sm text-center">
                                                            <button
                                                                onClick={() => onPrepareReorder(product)}
                                                                className="bg-blue-500/50 text-white text-xs font-bold py-1 px-3 rounded-md border border-blue-400 hover:bg-blue-500/80 transition"
                                                            >
                                                                Prepare Reorder
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-4">No products associated with this supplier.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            }) : (
                <div className="text-center py-8 text-gray-400">{suppliers.length > 0 ? "No suppliers match your search." : "No suppliers found."}</div>
            )}
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">
          {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="supplierName" className="block text-sm font-medium text-gray-300 mb-1">Supplier Name</label>
            <input id="supplierName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Eco Goods Inc." className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400" required />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
            <input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="e.g. contact@ecogoods.com" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400" required />
          </div>
          <div className="flex space-x-2 pt-2">
            {editingSupplier && (
              <button type="button" onClick={handleCancel} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
            )}
            <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierManager;