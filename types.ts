
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
  quickReorderEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Password is used for login simulation
  role: 'Admin' | 'Staff';
  branchId?: string;
}

export interface StockBatch {
  batchId: string;
  quantity: number;
  expiryDate?: string;
  dateReceived: string;
}

export interface StockLevel {
  branchId: string;
  batches: StockBatch[];
}

export interface HistoricalUsage {
  branchId: string;
  usage: number[]; // e.g., usage data for the last 7 days
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
  historicalUsage: HistoricalUsage[];
  historicalPrices: HistoricalPrice[];
  minStockLevel?: number;
  purchasePrice?: number;
}

export interface PredictionResult {
  productId: string;
  predictedUsage: number;
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
  productId?: string;
  branchId?: string;
}

export interface BranchPerformance {
    branchId: string;
    branchName: string;
    totalProducts: number;
    totalStockUnits: number;
    highUrgencyAlerts: number;
    topUsedItem?: Product;
}
