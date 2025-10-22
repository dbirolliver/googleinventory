
import React from 'react';
import { Urgency } from '../types';

const UrgencyPill: React.FC<{ urgency?: Urgency }> = ({ urgency }) => {
  const urgencyStyles: Record<Urgency, string> = {
    [Urgency.HIGH]: 'bg-red-500/20 text-red-300 border-red-400/50',
    [Urgency.MEDIUM]: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
    [Urgency.LOW]: 'bg-green-500/20 text-green-300 border-green-400/50',
  };

  if (!urgency) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300 border border-gray-400/50">N/A</span>;
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${urgencyStyles[urgency]} shrink-0`}>
      {urgency}
    </span>
  );
};

export default UrgencyPill;
