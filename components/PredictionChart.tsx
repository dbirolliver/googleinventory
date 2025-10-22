import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { InventoryItem } from '../types';

interface PredictionChartProps {
  data: InventoryItem[];
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data }) => {
  if (data.length === 0) {
      return (
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 h-[450px] flex items-center justify-center">
              <p className="text-gray-400">No data available for prediction chart.</p>
          </div>
      );
  }

  const chartData = data.map(item => ({
      name: item.name,
      'Current Stock': item.totalStock,
      'Predicted Sales': item.predictedSales ?? 0,
  }));

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 h-[450px] flex flex-col">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 shrink-0">Stock vs. Predicted Sales (Next 30d)</h2>
      <div className="w-full h-full relative">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
            data={chartData}
            margin={{
                top: 5, right: 10, left: -10, bottom: 65,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
            <XAxis dataKey="name" tick={{ fill: '#d1d5db', fontSize: 12 }} angle={-45} textAnchor="end" interval={0} />
            <YAxis tick={{ fill: '#d1d5db', fontSize: 12 }} />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ color: '#d1d5db' }} verticalAlign="top" align="right" />
            <Bar dataKey="Current Stock" fill="#3b82f6" />
            <Bar dataKey="Predicted Sales" fill="#22c55e" />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictionChart;