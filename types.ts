
export enum Urgency {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Branch {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Password is used for login simulation
  role: 'Admin' | 'Staff';
  branchId?: string;
}

export interface StockLevel {
  branchId: string;
  quantity: number;
  expiryDate?: string;
}

export interface HistoricalSale {
  branchId: string;
  sales: number[]; // e.g., sales data for the last 7 days
}

export interface HistoricalPrice {
    date: string;
    price: number;
}

export interface Product {
  id: string;
  name: string;
  supplierId: string;
  stockLevels: StockLevel[];
  historicalSales: HistoricalSale[];
  historicalPrices: HistoricalPrice[];
  minStockLevel?: number;
  purchasePrice?: number;
}

export interface PredictionResult {
  productId: string;
  predictedSales: number;
  restockSuggestion: string;
  urgency: Urgency;
  branchSuggestions?: {
    branchId: string;
    restockAmount: number;
  }[];
}

export interface PricePredictionResult {
    productId: string;
    productName: string;
    predictionSummary: string;
    predictedChangePercentage: number;
}

export interface InventoryItem extends Product, Partial<PredictionResult> {
  totalStock: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface BranchPerformance {
    branchId: string;
    branchName: string;
    totalProducts: number;
    totalStockUnits: number;
    highUrgencyAlerts: number;
    topSeller?: Product;
}
