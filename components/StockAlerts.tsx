import React from 'react';
import type { InventoryItem } from '../types';

interface StockAlertsProps {
  alerts: InventoryItem[];
  onAcknowledge: (productId: string) => void;
}

const StockAlerts: React.FC<StockAlertsProps> = ({ alerts, onAcknowledge }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Urgent Stock Alerts
      </h2>
      {alerts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No high-urgency alerts. All stock levels are looking good!</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {alerts.map(alert => (
            <li key={alert.id} className="p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
              <p className="font-semibold text-red-200">{alert.name}</p>
              <p className="text-sm text-red-300 mt-1">{alert.restockSuggestion}</p>
              <button 
                onClick={() => onAcknowledge(alert.id)}
                className="text-xs text-gray-300 hover:text-white mt-2 font-medium"
              >
                Acknowledge
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockAlerts;