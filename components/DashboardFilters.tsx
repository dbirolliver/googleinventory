
import React from 'react';
import type { Branch } from '../types';

interface DashboardFiltersProps {
    branches: Branch[];
    dateRange: string;
    setDateRange: (value: string) => void;
    branchId: string;
    setBranchId: (value: string) => void;
    isAdmin: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ branches, dateRange, setDateRange, branchId, setBranchId, isAdmin }) => {
    return (
        <div className="bg-black/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="dateRange" className="text-sm font-medium text-gray-300 shrink-0">Date Range:</label>
                <select 
                    id="dateRange"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                >
                    <option value="7" className="bg-gray-800">Last 7 Days</option>
                    <option value="30" className="bg-gray-800">Last 30 Days</option>
                    <option value="90" className="bg-gray-800">Last 90 Days</option>
                    <option value="365" className="bg-gray-800">Last Year</option>
                </select>
            </div>
            {isAdmin && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="branchFilter" className="text-sm font-medium text-gray-300 shrink-0">Branch:</label>
                    <select 
                        id="branchFilter"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    >
                        <option value="all" className="bg-gray-800">All Branches</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id} className="bg-gray-800">{b.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}

export default DashboardFilters;
