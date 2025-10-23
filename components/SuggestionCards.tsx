

import React from 'react';
import type { InventoryItem, Branch, Supplier, User } from '../types';
import { Urgency } from '../types';
import UrgencyPill from './UrgencyPill';

interface SuggestionCardsProps {
  suggestions: InventoryItem[];
  branches: Branch[];
  suppliers: Supplier[];
  currentUser: User;
  onAcknowledge: (productId: string) => void;
  onPrepareReorder: (product: InventoryItem) => void;
}

const SuggestionCards: React.FC<SuggestionCardsProps> = ({ suggestions, branches, suppliers, currentUser, onAcknowledge, onPrepareReorder }) => {
  const relevantSuggestions = suggestions.filter(item => 
    (item.urgency === Urgency.HIGH || item.urgency === Urgency.MEDIUM) && item.restockSuggestion
  );

  const getBranchName = (branchId: string) => branches.find(b => b.id === branchId)?.name || 'Unknown Branch';

  if (relevantSuggestions.length === 0) {
    return (
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold text-gray-200 mb-2">AI-Powered Suggestions</h2>
            <p className="text-gray-400 text-center py-8">No urgent suggestions at the moment. Inventory levels are stable.</p>
        </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">AI-Powered Suggestions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relevantSuggestions.map(item => {
          const supplier = suppliers.find(s => s.id === item.supplierId);
          const canQuickReorder = supplier?.quickReorderEnabled && currentUser.role === 'Admin';

          return (
            <div key={item.id} className="bg-black/20 p-4 rounded-lg border border-white/20 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-100 pr-2">{item.name}</h3>
                  <UrgencyPill urgency={item.urgency} />
                </div>
                <p className="text-sm text-gray-300 mb-3">{item.restockSuggestion}</p>
                
                <p className="text-sm text-gray-400">Predicted Usage (30d): <strong className="text-gray-200">{item.predictedUsage?.toLocaleString() ?? 'N/A'}</strong></p>

                {item.branchSuggestions && item.branchSuggestions.length > 0 && (
                  <div className="mt-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Branch Actions</h4>
                      <ul className="text-sm space-y-1">
                          {item.branchSuggestions.map(bs => (
                            <li key={bs.branchId} className="text-yellow-300">
                                <span className="font-medium text-gray-300">{getBranchName(bs.branchId)}:</span> Restock {bs.restockAmount} units
                            </li> 
                          ))}
                      </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => onAcknowledge(item.id)}
                  className="w-full text-center bg-white/10 text-white text-sm font-bold py-2 px-4 rounded-lg border border-white/30 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
                >
                  Acknowledge
                </button>
                {canQuickReorder && (
                    <button
                        onClick={() => onPrepareReorder(item)}
                        className="w-full text-center bg-blue-500/50 text-white text-sm font-bold py-2 px-4 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition-all duration-300"
                    >
                        Prepare Reorder
                    </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default SuggestionCards;
