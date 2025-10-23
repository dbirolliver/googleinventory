import React from 'react';
import type { BranchPerformance } from '../types';

interface BranchPerformanceOverviewProps {
  performanceData: BranchPerformance[];
  setCurrentPage: (page: string) => void;
}

const BranchPerformanceOverview: React.FC<BranchPerformanceOverviewProps> = ({ performanceData, setCurrentPage }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 h-full">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
        Clinic Overview
      </h2>
      {performanceData.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No clinic data available.</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {performanceData.map(branch => (
            <li key={branch.branchId} className="p-3 bg-black/20 border border-white/20 rounded-lg">
              <div className="flex justify-between items-start">
                 <p className="font-semibold text-gray-100 truncate" title={branch.branchName}>{branch.branchName}</p>
                 {branch.highUrgencyAlerts > 0 &&
                    <button 
                        onClick={() => setCurrentPage('Supplies')}
                        title="Go to Supplies to view alerts"
                        className="flex items-center text-xs text-red-300 font-medium bg-red-500/20 px-2 py-1 rounded-full shrink-0 hover:bg-red-500/40 transition cursor-pointer"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                         </svg>
                        {branch.highUrgencyAlerts} Alerts
                    </button>
                 }
              </div>
              <div className="text-sm text-gray-400 mt-2 grid grid-cols-2 gap-1">
                <span>Total Stock:</span><span className="text-gray-200 font-medium text-right">{branch.totalStockUnits.toLocaleString()} units</span>
                <span>Top Used Item:</span><span className="text-gray-200 font-medium text-right truncate" title={branch.topUsedItem?.name ?? 'N/A'}>{branch.topUsedItem?.name ?? 'N/A'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BranchPerformanceOverview;