import React from 'react';
import type { AuditLog } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-white/20">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Audit Log</h2>
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
            {logs.map(log => (
              <tr key={log.id}>
                <td className="py-3 px-4 text-sm text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="py-3 px-4 font-medium text-gray-200">{log.action}</td>
                <td className="py-3 px-4 text-gray-300">{log.details}</td>
              </tr>
            ))}
             {logs.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">No log entries yet.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogView;