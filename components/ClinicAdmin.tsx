
import React, { useState } from 'react';
import type { BranchPerformance } from '../types';

interface ClinicAdminProps {
  performanceData: BranchPerformance[];
  onAddClinic: (name: string) => void;
  onEditClinic: (id: string, newName: string) => void;
  onDeleteClinic: (id: string) => void;
}

const ClinicAdmin: React.FC<ClinicAdminProps> = ({ performanceData, onAddClinic, onEditClinic, onDeleteClinic }) => {
  const [newClinicName, setNewClinicName] = useState('');
  const [editingClinic, setEditingClinic] = useState<{ id: string; name: string } | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim()) return;
    onAddClinic(newClinicName);
    setNewClinicName('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic || !editingClinic.name.trim()) return;
    onEditClinic(editingClinic.id, editingClinic.name);
    setEditingClinic(null);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Clinic Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="border-b-2 border-white/30">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Clinic Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-right">Total Products</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-right">Total Stock Units</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-right">High Urgency Alerts</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map(branch => (
                <tr key={branch.branchId} className="border-b border-white/10">
                  <td className="py-4 px-4 font-medium text-gray-100">{branch.branchName}</td>
                  <td className="py-4 px-4 text-gray-300 text-right">{branch.totalProducts.toLocaleString()}</td>
                  <td className="py-4 px-4 text-gray-300 text-right">{branch.totalStockUnits.toLocaleString()}</td>
                  <td className="py-4 px-4 text-red-300 text-right font-semibold">{branch.highUrgencyAlerts.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center">
                    <button onClick={() => setEditingClinic({ id: branch.branchId, name: branch.branchName })} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Edit</button>
                    <button onClick={() => onDeleteClinic(branch.branchId)} className="text-red-400 hover:text-red-300 text-sm font-medium ml-4">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        {editingClinic ? (
          <>
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Edit Clinic</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="editClinicName" className="block text-sm font-medium text-gray-300 mb-1">Clinic Name</label>
                <input
                  id="editClinicName"
                  type="text"
                  value={editingClinic.name}
                  onChange={e => setEditingClinic({ ...editingClinic, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setEditingClinic(null)} className="w-full bg-white/10 text-white font-bold py-3 rounded-lg border border-white/30 hover:bg-white/20 transition">Cancel</button>
                <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">Save Changes</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Add New Clinic</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="newClinicName" className="block text-sm font-medium text-gray-300 mb-1">Clinic Name</label>
                <input
                  id="newClinicName"
                  type="text"
                  value={newClinicName}
                  onChange={e => setNewClinicName(e.target.value)}
                  placeholder="e.g. Northside Clinic"
                  className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-lg border border-white/30 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 transition">
                Add Clinic
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicAdmin;