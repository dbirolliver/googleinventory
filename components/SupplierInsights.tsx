
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Supplier, Product, PricePredictionResult } from '../types';

interface SupplierInsightsProps {
  suppliers: Supplier[];
  products: Product[];
  onRunPrediction: (supplier: Supplier, products: Product[]) => Promise<PricePredictionResult[]>;
  addAuditLog: (action: string, details: string) => void;
}

const PriceHistoryChart: React.FC<{ products: Product[] }> = ({ products }) => {
    if (!products || products.length === 0) return null;
    
    // Use a Set to get unique dates and sort them
    const allDates = [...new Set(products.flatMap(p => p.historicalPrices.map(hp => hp.date)))].sort();
    
    // Take a sample of dates to avoid overcrowding the chart (e.g., every 30th date)
    const sampledDates = allDates.filter((_, index) => index % 30 === 0 || index === allDates.length - 1).slice(-12);

    // FIX: Explicitly typing 'date' as a string resolves a TypeScript inference issue
    // where it was being inferred as 'unknown' or '{}', causing 'new Date()' to fail.
    const chartData = sampledDates.map((date: string) => {
        const entry: { [key: string]: any } = {
            // Format date for display
            name: new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
        products.forEach(p => {
            const pricePoint = p.historicalPrices.find(hp => hp.date === date);
            entry[p.name] = pricePoint ? pricePoint.price : null;
        });
        return entry;
    });

    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f97316'];

    return (
        <div className="mt-6 h-[350px] flex flex-col">
            <h4 className="text-lg font-semibold text-gray-200 mb-4 shrink-0">Historical Price Trends (Monthly)</h4>
            <div className="w-full h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                        <XAxis dataKey="name" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#d1d5db', fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '0.5rem'
                            }}
                            labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Legend />
                        {products.slice(0, 5).map((p, index) => (
                            <Line key={p.id} type="monotone" dataKey={p.name} stroke={colors[index % colors.length]} strokeWidth={2} connectNulls />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

const SupplierInsights: React.FC<SupplierInsightsProps> = ({ suppliers, products, onRunPrediction, addAuditLog }) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [predictions, setPredictions] = useState<PricePredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId);
  }, [selectedSupplierId, suppliers]);

  const supplierProducts = useMemo(() => {
    if (!selectedSupplierId) return [];
    return products.filter(p => p.supplierId === selectedSupplierId);
  }, [selectedSupplierId, products]);

  const handleRunPrediction = async () => {
    if (!selectedSupplier) return;
    setIsLoading(true);
    setError('');
    setPredictions([]);
    addAuditLog('Price Prediction Started', `Price prediction initiated for supplier "${selectedSupplier.name}".`);
    try {
      const results = await onRunPrediction(selectedSupplier, supplierProducts);
      setPredictions(results);
      addAuditLog('Price Prediction Successful', `Generated price predictions for ${results.length} products from "${selectedSupplier.name}".`);
    } catch (e) {
      setError('Failed to fetch price predictions. Please try again.');
      addAuditLog('Price Prediction Failed', `Failed to get price predictions for supplier "${selectedSupplier.name}".`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const PredictionResultCard: React.FC<{ result: PricePredictionResult }> = ({ result }) => {
    const isIncrease = result.predictedChangePercentage > 0;
    const isDecrease = result.predictedChangePercentage < 0;
    const colorClass = isIncrease ? 'text-red-400' : isDecrease ? 'text-green-400' : 'text-gray-300';
    const icon = isIncrease ? '▲' : isDecrease ? '▼' : '▬';

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-white/20">
            <h4 className="font-semibold text-gray-100">{result.productName}</h4>
            <p className="text-sm text-gray-300 mt-1">{result.predictionSummary}</p>
            <div className={`mt-2 text-lg font-bold flex items-center ${colorClass}`}>
                {icon} {result.predictedChangePercentage.toFixed(1)}%
                <span className="text-xs font-normal ml-2 text-gray-400">(next 3-6 months)</span>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Supplier Price Prediction</h2>
        <p className="text-gray-400 mb-6">Select a supplier to analyze historical pricing data and predict future price changes using Gemini.</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={selectedSupplierId}
            onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                setPredictions([]);
                setError('');
            }}
            className="w-full sm:w-1/2 px-4 py-3 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="">-- Select a Supplier --</option>
            {suppliers.map(s => <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>)}
          </select>
          <button
            onClick={handleRunPrediction}
            disabled={!selectedSupplierId || isLoading}
            className="w-full sm:w-auto bg-blue-500/50 text-white font-bold py-3 px-6 rounded-lg border border-blue-400 hover:bg-blue-500/80 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Run Price Prediction'}
          </button>
        </div>
      </div>
      
      {selectedSupplier && (
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
                Results for {selectedSupplier.name} ({supplierProducts.length} Products)
            </h3>
            {isLoading && (
                 <div className="text-center py-10">
                    <p className="text-gray-300">Generating insights with Gemini... This may take a moment.</p>
                 </div>
            )}
            {error && <p className="text-red-400 text-center py-10">{error}</p>}
            {!isLoading && predictions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {predictions.map(p => <PredictionResultCard key={p.productId} result={p} />)}
                </div>
            )}
            {!isLoading && supplierProducts.length > 0 && <PriceHistoryChart products={supplierProducts} />}
            {!isLoading && predictions.length === 0 && !error && (
                <div className="text-center py-10">
                    <p className="text-gray-400">
                        {selectedSupplierId ? 'Click "Run Price Prediction" to generate insights for this supplier.' : 'Select a supplier to begin.'}
                    </p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SupplierInsights;