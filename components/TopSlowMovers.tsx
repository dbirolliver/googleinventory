
import React from 'react';
import type { Product } from '../types';

interface TopSlowMoversProps {
    movers: {
        top: Product[];
        slow: Product[];
    };
    sales: Map<string, number>;
    dateRange: string;
}

const MoverList: React.FC<{title: string, products: Product[], sales: Map<string, number>, dateRange: string, color: string}> = ({title, products, sales, dateRange, color}) => (
    <div>
        <h3 className={`text-lg font-semibold mb-3 ${color}`}>{title}</h3>
        <ul className="space-y-2">
            {products.map((p, index) => (
                <li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-black/20">
                    <span className="text-gray-200 truncate pr-2">{index + 1}. {p.name}</span>
                    <span className={`font-bold text-gray-100`}>
                        {sales.get(p.id)?.toLocaleString() ?? 0}
                        <span className="text-xs font-normal text-gray-400 ml-1">sold</span>
                    </span>
                </li>
            ))}
        </ul>
    </div>
);


const TopSlowMovers: React.FC<TopSlowMoversProps> = ({ movers, sales, dateRange }) => {
    return (
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 h-full">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Product Performance (Last {dateRange} Days)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MoverList title="Top Movers" products={movers.top} sales={sales} dateRange={dateRange} color="text-green-400" />
                <MoverList title="Slow Movers" products={movers.slow} sales={sales} dateRange={dateRange} color="text-red-400" />
            </div>
        </div>
    );
};

export default TopSlowMovers;
