
import React, { useState } from 'react';
import type { InventoryItem, Branch, Supplier, User } from '../types';
import UrgencyPill from './UrgencyPill';

interface InventoryTableProps {
  inventory: InventoryItem[];
  branches: Branch[];
  suppliers: Supplier[];
  onAdjustStock: (product: InventoryItem) => void;
  onTransferStock: (product: InventoryItem) => void;
  onShowQR: (product: InventoryItem) => void;
  onEditProduct: (product: InventoryItem) => void;
  onDeleteProduct: (productId: string) => void;
  onAddNewSupplyClick: () => void;
  currentUser: User;
}

const RowActions: React.FC<{
    item: InventoryItem;
    isAdmin: boolean;
    onAdjustStock: () => void;
    onTransferStock: () => void;
    onShowQR: () => void;
    onEditProduct: () => void;
    onDeleteProduct: () => void;
}> = ({ item, isAdmin, onAdjustStock, onTransferStock, onShowQR, onEditProduct, onDeleteProduct }) => (
    <div className="flex items-center justify-center space-x-1">
        {isAdmin && <button onClick={onEditProduct} className="text-gray-300 hover:text-white p-1" title="Edit Product"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>}
        <button onClick={onAdjustStock} className="text-gray-300 hover:text-white p-1" title="Adjust Stock"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
        <button onClick={onTransferStock} className="text-gray-300 hover:text-white p-1" title="Transfer Stock"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" /></svg></button>
        <button onClick={onShowQR} className="text-gray-300 hover:text-white p-1" title="Show QR Code"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2a1 1 0 100 2h2a1 1 0 100-2H5zM3 11a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm2 2a1 1 0 100 2h2a1 1 0 100-2H5zM11 3a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V3zm2 2a1 1 0 100 2h2a1 1 0 100-2h-2zM11 11a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4zm2 2a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" /></svg></button>
        {isAdmin && <button onClick={onDeleteProduct} className="text-red-400 hover:text-red-300 p-1" title="Delete Product"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>}
    </div>
);


const AdminViewRow: React.FC<{ item: InventoryItem; branches: Branch[]; getSupplierName: (id: string) => string; onAdjustStock: (p: InventoryItem) => void; onTransferStock: (p: InventoryItem) => void; onShowQR: (p: InventoryItem) => void; onEditProduct: (p: InventoryItem) => void; onDeleteProduct: (productId: string) => void; }> = 
({ item, branches, getSupplierName, onAdjustStock, onTransferStock, onShowQR, onEditProduct, onDeleteProduct }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <>
        <tr className="hover:bg-white/5 transition-colors">
            <td className="py-3 px-4">
                <div className="font-medium text-gray-100 truncate max-w-xs" title={item.name}>{item.name}</div>
                <div className="text-xs text-gray-400">Min Stock: {item.minStockLevel ?? 'N/A'}</div>
            </td>
            <td className="py-3 px-4 text-sm text-gray-300">{getSupplierName(item.supplierId)}</td>
            <td className="py-3 px-4 text-center font-semibold text-lg text-gray-100">{item.totalStock.toLocaleString()}</td>
            <td className="py-3 px-4 text-center"><UrgencyPill urgency={item.urgency} /></td>
            <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center space-x-1">
                    <RowActions 
                        item={item} 
                        isAdmin={true} 
                        onAdjustStock={() => onAdjustStock(item)} 
                        onTransferStock={() => onTransferStock(item)} 
                        onShowQR={() => onShowQR(item)}
                        onEditProduct={() => onEditProduct(item)}
                        onDeleteProduct={() => onDeleteProduct(item.id)}
                    />
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-300 hover:text-white p-1" title="Expand Details">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </td>
        </tr>
         {isExpanded && (
            <tr>
                <td colSpan={5} className="p-4 bg-black/20">
                    <div className="space-y-3">
                    {item.stockLevels.map(sl => {
                        const branchTotal = sl.batches.reduce((sum, b) => sum + b.quantity, 0);
                        if(branchTotal === 0) return null;
                        return (
                        <div key={sl.branchId}>
                             <p className="font-semibold text-gray-200">{branches.find(b => b.id === sl.branchId)?.name} - Total: {branchTotal} units</p>
                             <div className="space-y-2 mt-2">
                                {sl.batches.map(batch => (
                                    <div key={batch.batchId} className="grid grid-cols-3 gap-x-4 items-center bg-black/20 p-2 rounded-md text-sm">
                                        <span className="font-medium text-gray-100 col-span-1">{batch.quantity} units</span>
                                        <span className="text-gray-400 col-span-1">
                                            Received: {new Date(batch.dateReceived).toLocaleDateString()}
                                        </span>
                                        <span className={`col-span-1 ${batch.expiryDate ? 'text-yellow-300 font-semibold' : 'text-gray-500'}`}>
                                            Expires: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )})}
                    </div>
                </td>
            </tr>
         )}
        </>
    )
};


const StaffViewRow: React.FC<{ item: InventoryItem; branches: Branch[]; getSupplierName: (id: string) => string; onAdjustStock: (p: InventoryItem) => void; onTransferStock: (p: InventoryItem) => void; onShowQR: (p: InventoryItem) => void; onEditProduct: (p: InventoryItem) => void; onDeleteProduct: (productId: string) => void; }> = 
({ item, branches, getSupplierName, onAdjustStock, onTransferStock, onShowQR, onEditProduct, onDeleteProduct }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <>
            <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                    <div className="font-medium text-gray-100 truncate max-w-xs" title={item.name}>{item.name}</div>
                    <div className="text-xs text-gray-400">Min Stock: {item.minStockLevel ?? 'N/A'}</div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-300">{getSupplierName(item.supplierId)}</td>
                <td className="py-3 px-4 text-center font-semibold text-lg text-gray-100">{item.totalStock.toLocaleString()}</td>
                <td className="py-3 px-4 text-center"><UrgencyPill urgency={item.urgency} /></td>
                <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                        <RowActions 
                            item={item} 
                            isAdmin={false} 
                            onAdjustStock={() => onAdjustStock(item)} 
                            onTransferStock={() => onTransferStock(item)} 
                            onShowQR={() => onShowQR(item)}
                            onEditProduct={() => onEditProduct(item)}
                            onDeleteProduct={() => onDeleteProduct(item.id)}
                        />
                         <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-300 hover:text-white p-1" title="Expand Details">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={5} className="p-4 bg-black/20">
                        <div className="space-y-3">
                        {item.stockLevels.map(sl => {
                            const branchTotal = sl.batches.reduce((sum, b) => sum + b.quantity, 0);
                            if(branchTotal === 0) return null;
                            return (
                            <div key={sl.branchId}>
                                 <p className="font-semibold text-gray-200">{branches.find(b => b.id === sl.branchId)?.name} - Total: {branchTotal} units</p>
                                 <div className="space-y-2 mt-2">
                                    {sl.batches.map(batch => (
                                        <div key={batch.batchId} className="grid grid-cols-3 gap-x-4 items-center bg-black/20 p-2 rounded-md text-sm">
                                            <span className="font-medium text-gray-100 col-span-1">{batch.quantity} units</span>
                                            <span className="text-gray-400 col-span-1">
                                                Received: {new Date(batch.dateReceived).toLocaleDateString()}
                                            </span>
                                            <span className={`col-span-1 ${batch.expiryDate ? 'text-yellow-300 font-semibold' : 'text-gray-500'}`}>
                                                Expires: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )})}
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
};


const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, branches, suppliers, onAdjustStock, onTransferStock, onShowQR, onEditProduct, onDeleteProduct, onAddNewSupplyClick, currentUser }) => {
  const getSupplierName = (supplierId: string) => suppliers.find(s => s.id === supplierId)?.name || 'Unknown';
  const isAdmin = currentUser.role === 'Admin';
  
  return (
    <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-white/20">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-200">
            {isAdmin ? 'Full Supplies List' : `Supplies for ${branches.find(b => b.id === currentUser.branchId)?.name}`}
        </h2>
        <button 
            onClick={onAddNewSupplyClick} 
            className="flex items-center gap-2 bg-blue-500/50 text-white font-bold py-2 px-4 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Supply
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left min-w-max">
                <thead className="border-b-2 border-white/30 sticky top-0 bg-black/20 backdrop-blur-lg z-10">
                    {isAdmin ? (
                        <tr>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Product</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Supplier</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Total Stock</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Urgency</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Actions</th>
                        </tr>
                    ) : (
                        <tr>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Product</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Supplier</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Clinic Stock</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Urgency</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Actions</th>
                        </tr>
                    )}
                </thead>
                <tbody className="divide-y divide-white/10">
                    {inventory.map(item => (
                        isAdmin ? 
                        <AdminViewRow key={item.id} item={item} getSupplierName={getSupplierName} onAdjustStock={onAdjustStock} onTransferStock={onTransferStock} onShowQR={onShowQR} onEditProduct={onEditProduct} onDeleteProduct={onDeleteProduct} branches={branches} /> :
                        <StaffViewRow key={item.id} item={item} getSupplierName={getSupplierName} onAdjustStock={onAdjustStock} onTransferStock={onTransferStock} onShowQR={onShowQR} onEditProduct={onEditProduct} onDeleteProduct={onDeleteProduct} branches={branches} />
                    ))}
                    {inventory.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400">No inventory items found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
