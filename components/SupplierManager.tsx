
import React, { useState, useEffect, useMemo } from 'react';
import type { Supplier } from '../types';

interface SupplierManagerProps {
  suppliers: Supplier[];
  onAddSupplier: (name: string, contactEmail: string) => void;
  onEditSupplier: (id: string, name: string, contactEmail: string) => void;
  onDeleteSupplier: (id: string) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, onAddSupplier, onEditSupplier, onDeleteSupplier }) => {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-200">Supplier List</h2>
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="border-b-2 border-white/30 sticky top-0 bg-black/20 backdrop-blur-lg">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Contact Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td className="py-4 px-4 font-medium text-gray-100">{supplier.name}</td>
                  <td className="py-4 px-4 text-gray-300">{supplier.contactEmail}</td>
                  <td className="py-4 px-4 text-center">
                    <button onClick={() => setEditingSupplier(supplier)} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Edit</button>
                    <button onClick={() => onDeleteSupplier(supplier.id)} className="text-red-400 hover:text-red-300 text-sm font-medium ml-4">Delete</button>
                  </td>
                </tr>
              ))}
               {filteredSuppliers.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">{suppliers.length > 0 ? "No suppliers match your search." : "No suppliers found."}</td>
                </tr>
             )}
            </tbody>
          </table>
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
