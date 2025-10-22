
import type { Product, Branch, Supplier, HistoricalPrice, User } from './types';

export const USERS: User[] = [
    { id: 'user-1', name: 'Alex Johnson', username: 'admin', password: 'password123', role: 'Admin' },
    { id: 'user-2', name: 'Maria Garcia', username: 'maria', password: 'password123', role: 'Staff', branchId: 'branch-1' },
    { id: 'user-3', name: 'Sam Chen', username: 'sam', password: 'password123', role: 'Staff', branchId: 'branch-2' },
    { id: 'user-4', name: 'Priya Patel', username: 'priya', password: 'password123', role: 'Staff', branchId: 'branch-3' },
];

export const BRANCHES: Branch[] = [
  { id: 'branch-1', name: 'Downtown' },
  { id: 'branch-2', name: 'Westside' },
  { id: 'branch-3', name: 'North End' },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Eco Goods Inc.', contactEmail: 'contact@ecogoods.com' },
  { id: 'sup-2', name: 'Green Supplies Co.', contactEmail: 'sales@greensupplies.co' },
  { id: 'sup-3', name: 'Sustainable Living Ltd.', contactEmail: 'orders@sustainable.ltd' },
];

// Helper function to generate historical data
const generateHistoricalData = (baseSales: number, basePrice: number, days: number) => {
    const historicalSales: number[] = [];
    const historicalPrices: HistoricalPrice[] = [];
    let currentPrice = basePrice;

    for (let i = days; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Sales data (last 7 days for each branch)
        if (i <= 7) {
            const dailySales = baseSales + Math.floor(Math.random() * 6) - 3; // Fluctuation
            historicalSales.push(Math.max(0, dailySales));
        }

        // Price data
        if (i > 1 && i % 30 === 0) { // Price changes roughly monthly
            currentPrice += (Math.random() - 0.45) * basePrice * 0.1; // up to 10% change
        }
        historicalPrices.push({
            date: date.toISOString().split('T')[0],
            price: parseFloat(currentPrice.toFixed(2)),
        });
    }
    return { sales: historicalSales, prices: historicalPrices };
};

const nearExpiry = new Date();
nearExpiry.setDate(nearExpiry.getDate() + 25);
const nearExpiryString = nearExpiry.toISOString().split('T')[0];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Bamboo Toothbrush Set (4-pack)',
    supplierId: 'sup-1',
    minStockLevel: 50,
    purchasePrice: 5.00,
    stockLevels: [
      { branchId: 'branch-1', quantity: 85, expiryDate: '2025-12-31' },
      { branchId: 'branch-2', quantity: 150, expiryDate: '2025-12-31' },
      { branchId: 'branch-3', quantity: 40, expiryDate: '2025-11-30' },
    ],
    historicalSales: [
        { branchId: 'branch-1', sales: generateHistoricalData(10, 5.00, 365).sales },
        { branchId: 'branch-2', sales: generateHistoricalData(15, 5.00, 365).sales },
        { branchId: 'branch-3', sales: generateHistoricalData(5, 5.00, 365).sales },
    ],
    historicalPrices: generateHistoricalData(10, 5.00, 365).prices,
  },
  {
    id: 'prod-2',
    name: 'Organic Cotton Tote Bag',
    supplierId: 'sup-2',
    minStockLevel: 100,
    purchasePrice: 12.50,
    stockLevels: [
      { branchId: 'branch-1', quantity: 120, expiryDate: '2026-06-30' },
      { branchId: 'branch-2', quantity: 200, expiryDate: '2026-06-30' },
      { branchId: 'branch-3', quantity: 90, expiryDate: nearExpiryString },
    ],
    historicalSales: [
        { branchId: 'branch-1', sales: generateHistoricalData(20, 12.50, 365).sales },
        { branchId: 'branch-2', sales: generateHistoricalData(25, 12.50, 365).sales },
        { branchId: 'branch-3', sales: generateHistoricalData(10, 12.50, 365).sales },
    ],
    historicalPrices: generateHistoricalData(20, 12.50, 365).prices,
  },
    {
    id: 'prod-3',
    name: 'Reusable Silicone Food Bags (Set of 3)',
    supplierId: 'sup-1',
    minStockLevel: 40,
    purchasePrice: 15.00,
    stockLevels: [
      { branchId: 'branch-1', quantity: 30, expiryDate: '2025-08-01' },
      { branchId: 'branch-2', quantity: 50, expiryDate: '2025-08-01' },
      { branchId: 'branch-3', quantity: 75, expiryDate: '2025-09-01' },
    ],
     historicalSales: [
        { branchId: 'branch-1', sales: generateHistoricalData(8, 15.00, 365).sales },
        { branchId: 'branch-2', sales: generateHistoricalData(12, 15.00, 365).sales },
        { branchId: 'branch-3', sales: generateHistoricalData(18, 15.00, 365).sales },
    ],
    historicalPrices: generateHistoricalData(8, 15.00, 365).prices,
  },
  {
    id: 'prod-4',
    name: 'Stainless Steel Water Bottle (25oz)',
    supplierId: 'sup-3',
    minStockLevel: 50,
    purchasePrice: 22.00,
    stockLevels: [
      { branchId: 'branch-1', quantity: 60, expiryDate: '2027-01-01' },
      { branchId: 'branch-2', quantity: 25, expiryDate: '2027-01-01' },
      { branchId: 'branch-3', quantity: 100, expiryDate: '2027-01-01' },
    ],
    historicalSales: [
        { branchId: 'branch-1', sales: generateHistoricalData(12, 22.00, 365).sales },
        { branchId: 'branch-2', sales: generateHistoricalData(20, 22.00, 365).sales },
        { branchId: 'branch-3', sales: generateHistoricalData(15, 22.00, 365).sales },
    ],
    historicalPrices: generateHistoricalData(12, 22.00, 365).prices,
  },
  {
    id: 'prod-5',
    name: 'Natural Loofah Sponges (5-pack)',
    supplierId: 'sup-2',
    minStockLevel: 200,
    purchasePrice: 8.00,
    stockLevels: [
      { branchId: 'branch-1', quantity: 250, expiryDate: '2026-02-01' },
      { branchId: 'branch-2', quantity: 300, expiryDate: '2026-02-01' },
      { branchId: 'branch-3', quantity: 180, expiryDate: '2026-03-01' },
    ],
    historicalSales: [
        { branchId: 'branch-1', sales: generateHistoricalData(5, 8.00, 365).sales },
        { branchId: 'branch-2', sales: generateHistoricalData(8, 8.00, 365).sales },
        { branchId: 'branch-3', sales: generateHistoricalData(4, 8.00, 365).sales },
    ],
    historicalPrices: generateHistoricalData(5, 8.00, 365).prices,
  },
];
