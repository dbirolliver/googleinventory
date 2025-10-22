
import React, { useMemo } from 'react';
import type { InventoryItem } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-black/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 flex items-center space-x-4">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-300 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
    </div>
  </div>
);

interface DashboardMetricsProps {
    data: InventoryItem[];
    alertCount: number;
    kpis: {
        totalInventoryValue: number;
        stockTurnover: number;
        nearingExpiryCount: number;
    }
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ data, alertCount, kpis }) => {
  const metrics = useMemo(() => {
    const totalProducts = data.length;
    const totalStock = data.reduce((sum, item) => sum + item.totalStock, 0);
    return { totalProducts, totalStock };
  }, [data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <MetricCard 
        title="Total Products" 
        value={metrics.totalProducts}
        color="bg-blue-500/20 text-blue-300"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
      <MetricCard 
        title="Total Stock Units" 
        value={metrics.totalStock.toLocaleString()}
        color="bg-green-500/20 text-green-300"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        }
      />
      <MetricCard 
        title="Total Inventory Value" 
        value={`$${kpis.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        color="bg-purple-500/20 text-purple-300"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0 1v.01M12 20v-1m0-1v-1m-6.09-4.25c.14-.17.29-.33.45-.48m5.64.48a9.002 9.002 0 005.64-4.25m-11.73 0a9.002 9.002 0 015.64-4.25" />
            </svg>
        }
      />
      <MetricCard 
        title="Stock Turnover (30d)" 
        value={kpis.stockTurnover.toFixed(2)}
        color="bg-indigo-500/20 text-indigo-300"
        icon={
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
           </svg>
        }
      />
      <MetricCard 
        title="Nearing Expiry (30d)" 
        value={kpis.nearingExpiryCount}
        color="bg-red-500/20 text-red-300"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
};

export default DashboardMetrics;
