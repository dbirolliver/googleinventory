

import React, { useState, useMemo } from 'react';
import type { AuditLog, User, Product, Branch } from '../types';

interface InventoryHistoryViewProps {
  logs: AuditLog[];
  currentUser: User;
  products: Product[];
  branches: Branch[];
}

const ICONS: Record<string, React.ReactNode> = {
    'Stock Adjusted': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
    'Stock Transferred': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" /></svg>,
    'Default': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
};


const AdminAuditLog: React.FC<{logs: AuditLog[]}> = ({ logs }) => {
    const [filter, setFilter] = useState('All');
    const actionTypes = useMemo(() => ['All', ...Array.from(new Set(logs.map(log => log.action)))], [logs]);

    const filteredLogs = useMemo(() => {
        if (filter === 'All') return logs;
        return logs.filter(log => log.action === filter);
    }, [logs, filter]);

    return (
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-white/20">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-200">Audit Log for Compliance</h2>
            <div className="flex items-center gap-2">
                <label htmlFor="actionFilter" className="text-sm font-medium text-gray-300 shrink-0">Filter by Action:</label>
                <select id="actionFilter" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full sm:w-48 px-3 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition">
                    {actionTypes.map(type => (<option key={type} value={type} className="bg-gray-800">{type}</option>))}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className="border-b-2 border-white/30 sticky top-0 bg-black/20 backdrop-blur-lg">
                <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Timestamp</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Action</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Details</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
                {filteredLogs.map(log => (
                <tr key={log.id}>
                    <td className="py-3 px-4 text-sm text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-gray-200">{log.action}</td>
                    <td className="py-3 px-4 text-gray-300">{log.details}</td>
                </tr>
                ))}
                {filteredLogs.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-8 text-gray-400">No log entries match the current filter.</td></tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
};

const StaffInventoryHistory: React.FC<{logs: AuditLog[], currentUser: User, products: Product[]}> = ({ logs, currentUser, products }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

    const clinicProducts = useMemo(() => {
        return products
            .filter(p => p.stockLevels.some(sl => sl.branchId === currentUser.branchId))
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, currentUser.branchId, searchTerm]);

    const handleToggleExpand = (productId: string) => {
        setExpandedProductId(prev => prev === productId ? null : productId);
    };
    
    return (
         <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-white/20">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-gray-200">Inventory History</h2>
                <input
                    type="text"
                    placeholder="Search supplies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-4 pr-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition placeholder:text-gray-400"
                />
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {clinicProducts.map(product => {
                    const isExpanded = expandedProductId === product.id;
                    const productHistory = logs.filter(log => log.productId === product.id && (log.branchId === currentUser.branchId || (log.action === 'Stock Transferred' && log.details.includes(currentUser.branchId || ''))));

                    return (
                        <div key={product.id} className="bg-black/20 rounded-lg border border-white/20">
                            <button onClick={() => handleToggleExpand(product.id)} className="w-full flex items-center p-4 text-left hover:bg-white/5 transition">
                                <span className="font-medium text-gray-100 flex-1">{product.name}</span>
                                <span className="text-sm text-gray-400 mr-4">({productHistory.length} events)</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            {isExpanded && (
                                <div className="p-4 border-t border-white/10">
                                    {productHistory.length > 0 ? (
                                        <ul className="space-y-3">
                                            {productHistory.map(log => (
                                                <li key={log.id} className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 text-gray-400 mt-1">{ICONS[log.action] || ICONS['Default']}</div>
                                                    <div>
                                                        <p className="text-sm text-gray-200">{log.details}</p>
                                                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">No history found for this product at your clinic.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
                 {clinicProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        {searchTerm ? "No supplies match your search." : "No supplies found for your clinic."}
                    </div>
                 )}
            </div>
         </div>
    );
};

const InventoryHistoryView: React.FC<InventoryHistoryViewProps> = ({ logs, currentUser, products, branches }) => {
  if (currentUser.role === 'Admin') {
    return <AdminAuditLog logs={logs} />;
  }
  return <StaffInventoryHistory logs={logs} currentUser={currentUser} products={products} />;
};

export default InventoryHistoryView;