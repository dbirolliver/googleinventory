
import type { Product, Branch, Supplier, HistoricalPrice, User, StockBatch } from './types';
import { v4 as uuidv4 } from 'uuid';

export const USERS: User[] = [
    { id: 'user-1', name: 'Dr. Evelyn Reed', username: 'admin', password: 'password123', role: 'Admin' },
    { id: 'user-2', name: 'Maria Garcia', username: 'maria', password: 'password123', role: 'Staff', branchId: 'branch-1' },
    { id: 'user-3', name: 'Sam Chen', username: 'sam', password: 'password123', role: 'Staff', branchId: 'branch-2' },
    { id: 'user-4', name: 'Priya Patel', username: 'priya', password: 'password123', role: 'Staff', branchId: 'branch-3' },
];

export const BRANCHES: Branch[] = [
  { id: 'branch-1', name: 'Premierlux Downtown' },
  { id: 'branch-2', name: 'Premierlux Westside' },
  { id: 'branch-3', name: 'Premierlux North End' },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'DentalSupplyCo', contactEmail: 'sales@dentalsupplyco.com', quickReorderEnabled: true },
  { id: 'sup-2', name: 'MediPro Essentials', contactEmail: 'contact@medipro.com', quickReorderEnabled: false },
  { id: 'sup-3', name: 'OrthoSource Inc.', contactEmail: 'orders@orthosource.com', quickReorderEnabled: false },
];

// Helper function to generate historical data
const generateHistoricalData = (baseUsage: number, basePrice: number, days: number) => {
    const historicalUsage: number[] = [];
    const historicalPrices: HistoricalPrice[] = [];
    let currentPrice = basePrice;

    for (let i = days; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Usage data (last 7 days for each branch)
        if (i <= 7) {
            const dailyUsage = baseUsage + Math.floor(Math.random() * 6) - 3; // Fluctuation
            historicalUsage.push(Math.max(0, dailyUsage));
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
    return { usage: historicalUsage, prices: historicalPrices };
};

const getDateString = (offsetDays: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Nitrile Gloves (Box of 100)',
    supplierId: 'sup-2',
    minStockLevel: 20, // 20 boxes
    purchasePrice: 15.00,
    stockLevels: [
      { branchId: 'branch-1', batches: [{ batchId: uuidv4(), quantity: 25, dateReceived: getDateString(-40) }] },
      { branchId: 'branch-2', batches: [{ batchId: uuidv4(), quantity: 15, dateReceived: getDateString(-40) }] },
      { branchId: 'branch-3', batches: [{ batchId: uuidv4(), quantity: 40, dateReceived: getDateString(-40) }] },
    ],
    historicalUsage: [
        { branchId: 'branch-1', usage: generateHistoricalData(3, 15.00, 365).usage },
        { branchId: 'branch-2', usage: generateHistoricalData(5, 15.00, 365).usage },
        { branchId: 'branch-3', usage: generateHistoricalData(2, 15.00, 365).usage },
    ],
    historicalPrices: generateHistoricalData(3, 15.00, 365).prices,
  },
  {
    id: 'prod-2',
    name: 'Anesthetic Cartridges (Box of 50)',
    supplierId: 'sup-1',
    minStockLevel: 10, // 10 boxes
    purchasePrice: 55.00,
    stockLevels: [
      { branchId: 'branch-1', batches: [{ batchId: uuidv4(), quantity: 12, expiryDate: '2025-06-30', dateReceived: getDateString(-60) }] },
      { branchId: 'branch-2', batches: [
          { batchId: uuidv4(), quantity: 8, expiryDate: getDateString(25), dateReceived: getDateString(-90) },
          { batchId: uuidv4(), quantity: 10, expiryDate: getDateString(80), dateReceived: getDateString(-5) } // New batch
      ] },
      { branchId: 'branch-3', batches: [{ batchId: uuidv4(), quantity: 15, expiryDate: '2025-08-31', dateReceived: getDateString(-60) }] },
    ],
    historicalUsage: [
        { branchId: 'branch-1', usage: generateHistoricalData(2, 55.00, 365).usage },
        { branchId: 'branch-2', usage: generateHistoricalData(1, 55.00, 365).usage },
        { branchId: 'branch-3', usage: generateHistoricalData(3, 55.00, 365).usage },
    ],
    historicalPrices: generateHistoricalData(2, 55.00, 365).prices,
  },
    {
    id: 'prod-3',
    name: 'Dental Composite (Syringe)',
    supplierId: 'sup-1',
    minStockLevel: 30,
    purchasePrice: 42.00,
    stockLevels: [
      { branchId: 'branch-1', batches: [{ batchId: uuidv4(), quantity: 50, expiryDate: '2025-08-01', dateReceived: getDateString(-50) }] },
      { branchId: 'branch-2', batches: [
          { batchId: uuidv4(), quantity: 10, expiryDate: getDateString(45), dateReceived: getDateString(-120) }, // Older batch
          { batchId: uuidv4(), quantity: 15, expiryDate: getDateString(150), dateReceived: getDateString(-10) } // Newer batch
      ] },
      { branchId: 'branch-3', batches: [{ batchId: uuidv4(), quantity: 40, expiryDate: '2025-09-01', dateReceived: getDateString(-50) }] },
    ],
     historicalUsage: [
        { branchId: 'branch-1', usage: generateHistoricalData(5, 42.00, 365).usage },
        { branchId: 'branch-2', usage: generateHistoricalData(8, 42.00, 365).usage },
        { branchId: 'branch-3', usage: generateHistoricalData(6, 42.00, 365).usage },
    ],
    historicalPrices: generateHistoricalData(5, 42.00, 365).prices,
  },
  {
    id: 'prod-4',
    name: 'Impression Material (Kit)',
    supplierId: 'sup-3',
    minStockLevel: 15,
    purchasePrice: 120.00,
    stockLevels: [
      { branchId: 'branch-1', batches: [{ batchId: uuidv4(), quantity: 18, dateReceived: getDateString(-20) }] },
      { branchId: 'branch-2', batches: [{ batchId: uuidv4(), quantity: 25, dateReceived: getDateString(-20) }] },
      { branchId: 'branch-3', batches: [{ batchId: uuidv4(), quantity: 12, dateReceived: getDateString(-20) }] },
    ],
    historicalUsage: [
        { branchId: 'branch-1', usage: generateHistoricalData(1, 120.00, 365).usage },
        { branchId: 'branch-2', usage: generateHistoricalData(2, 120.00, 365).usage },
        { branchId: 'branch-3', usage: generateHistoricalData(1, 120.00, 365).usage },
    ],
    historicalPrices: generateHistoricalData(1, 120.00, 365).prices,
  },
  {
    id: 'prod-5',
    name: 'Sterilization Pouches (Box of 200)',
    supplierId: 'sup-2',
    minStockLevel: 10,
    purchasePrice: 25.00,
    stockLevels: [
      { branchId: 'branch-1', batches: [{ batchId: uuidv4(), quantity: 11, dateReceived: getDateString(-15) }] },
      { branchId: 'branch-2', batches: [{ batchId: uuidv4(), quantity: 15, dateReceived: getDateString(-15) }] },
      { branchId: 'branch-3', batches: [{ batchId: uuidv4(), quantity: 8, dateReceived: getDateString(-15) }] },
    ],
    historicalUsage: [
        { branchId: 'branch-1', usage: generateHistoricalData(4, 25.00, 365).usage },
        { branchId: 'branch-2', usage: generateHistoricalData(5, 25.00, 365).usage },
        { branchId: 'branch-3', usage: generateHistoricalData(3, 25.00, 365).usage },
    ],
    historicalPrices: generateHistoricalData(4, 25.00, 365).prices,
  },
];
