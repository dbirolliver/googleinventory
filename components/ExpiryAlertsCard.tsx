import React from 'react';

// Define a type for the expiring items
interface ExpiringItem {
    productName: string;
    branchName: string;
    quantity: number;
    daysUntilExpiry: number;
}

interface ExpiryAlertsCardProps {
  expiringItems: ExpiringItem[];
}

const ExpiryAlertsCard: React.FC<ExpiryAlertsCardProps> = ({ expiringItems }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 h-full">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Expiring Soon (Next 30 Days)</h2>
      {expiringItems.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No supplies are expiring soon.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {expiringItems.map((item, index) => {
             const isUrgent = item.daysUntilExpiry <= 7;
             const daysText = item.daysUntilExpiry === 0 ? 'Today' : item.daysUntilExpiry === 1 ? '1 day' : `${item.daysUntilExpiry} days`;

             return (
                <li key={index} className={`p-3 rounded-lg border ${isUrgent ? 'bg-red-500/20 border-red-400/50' : 'bg-yellow-500/10 border-yellow-400/30'}`}>
                    <div className="flex justify-between items-start gap-2">
                         <p className={`font-semibold ${isUrgent ? 'text-red-200' : 'text-yellow-200'}`}>{item.productName}</p>
                         <span className={`text-xs font-bold shrink-0 text-right ${isUrgent ? 'text-red-200' : 'text-yellow-200'}`}>
                            Expires in {daysText}
                         </span>
                    </div>
                     <div className={`text-sm mt-1 grid grid-cols-2 gap-1 ${isUrgent ? 'text-red-300' : 'text-yellow-300'}`}>
                        <span>Clinic:</span><span className="text-right font-medium">{item.branchName}</span>
                        <span>Quantity:</span><span className="text-right font-medium">{item.quantity} units</span>
                     </div>
                </li>
             )
          })}
        </ul>
      )}
    </div>
  );
};

export default ExpiryAlertsCard;
