
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Product, Branch, Supplier, InventoryItem, PredictionResult, PricePredictionResult, BranchPerformance, AuditLog, User, StockLevel, StockBatch } from './types';

// Mock data and services (now initial data for DB)
import { INITIAL_PRODUCTS, INITIAL_BRANCHES, INITIAL_SUPPLIERS, INITIAL_USERS } from './data';
import { getRestockPredictions, getSupplierPricePrediction } from './services/geminiService';
import { openDatabase, getAllData, putAllData, putData, deleteData } from './services/dbService'; // Import DB service

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './LoginPage';
import DashboardMetrics from './components/DashboardMetrics';
import InventoryTable from './components/InventoryTable';
import SupplierManager from './components/SupplierManager';
import InventoryHistoryView from './components/InventoryHistoryView';
import Chatbot from './components/Chatbot';
import SupplierInsights from './components/SupplierInsights';
import ClinicAdmin from './components/ClinicAdmin';
import UserAdmin from './components/UserAdmin';
import SuggestionCards from './components/SuggestionCards';
import DashboardFilters from './components/DashboardFilters';
import TopSlowMovers from './components/TopSlowMovers';
import BranchPerformanceOverview from './components/BranchPerformanceOverview';
import ExpiryAlertsCard from './components/ExpiryAlertsCard';


// Modals
import StockAdjustmentModal from './components/StockAdjustmentModal';
import StockTransferModal from './components/StockTransferModal';
import QRCodeModal from './components/QRCodeModal';
import EditProductModal from './components/EditProductModal';
import ReorderModal from './components/ReorderModal';
import AddProductModal from './components/AddProductModal';

const App: React.FC = () => {
  // Authentication and User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  
  // Modal State
  const [modal, setModal] = useState<'adjust' | 'transfer' | 'qr' | 'edit' | 'reorder' | 'add' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  
  // Dashboard Filter State
  const [dashboardDateRange, setDashboardDateRange] = useState('30'); // '7', '30', '90', '365'
  const [dashboardBranchId, setDashboardBranchId] = useState('all');

  // --- Data & Auth ---
  
  const addAuditLog = useCallback((action: string, details: string, context?: { productId?: string; branchId?: string; }) => {
    const newLog: AuditLog = { id: uuidv4(), timestamp: new Date().toISOString(), action, details, ...context };
    setAuditLogs(prev => {
        const updatedLogs = [newLog, ...prev];
        putAllData('auditLogs', updatedLogs).catch(err => console.error("Failed to save audit log to DB", err));
        return updatedLogs;
    });
  }, []); // Removed auditLogs from dependency array to prevent stale closure for putAllData

  useEffect(() => {
    const loadData = async () => {
      try {
        await openDatabase();

        let loadedProducts = await getAllData<Product>('products');
        let loadedBranches = await getAllData<Branch>('branches');
        let loadedSuppliers = await getAllData<Supplier>('suppliers');
        let loadedUsers = await getAllData<User>('users');
        let loadedAuditLogs = await getAllData<AuditLog>('auditLogs');

        if (loadedProducts.length === 0) {
          console.log('No products in DB, loading initial mock data.');
          loadedProducts = INITIAL_PRODUCTS;
          await putAllData('products', INITIAL_PRODUCTS);
        }
        if (loadedBranches.length === 0) {
            console.log('No branches in DB, loading initial mock data.');
            loadedBranches = INITIAL_BRANCHES;
            await putAllData('branches', INITIAL_BRANCHES);
        }
        if (loadedSuppliers.length === 0) {
            console.log('No suppliers in DB, loading initial mock data.');
            loadedSuppliers = INITIAL_SUPPLIERS;
            await putAllData('suppliers', INITIAL_SUPPLIERS);
        }
        if (loadedUsers.length === 0) {
            console.log('No users in DB, loading initial mock data.');
            loadedUsers = INITIAL_USERS;
            await putAllData('users', INITIAL_USERS);
        }
        // Audit logs are not critical to initialize if empty, they will be added dynamically
        
        setProducts(loadedProducts);
        setBranches(loadedBranches);
        setSuppliers(loadedSuppliers);
        setUsers(loadedUsers);
        setAuditLogs(loadedAuditLogs);

        addAuditLog('System Startup', 'Application initialized and data loaded/migrated.');
      } catch (error) {
        console.error("Failed to load data from IndexedDB:", error);
        // Fallback to initial mock data if DB fails
        setProducts(INITIAL_PRODUCTS);
        setBranches(INITIAL_BRANCHES);
        setSuppliers(INITIAL_SUPPLIERS);
        setUsers(INITIAL_USERS);
        addAuditLog('System Startup', 'Application initialized, failed to load persistent data, using mock data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addAuditLog]);

  const runRestockPredictions = useCallback(async () => {
    if (isPredictionsLoading || products.length === 0 || branches.length === 0 || suppliers.length === 0) return;
    setIsPredictionsLoading(true);
    addAuditLog('Prediction Started', 'Restock prediction analysis initiated.');
    try {
      const results = await getRestockPredictions(products, branches, suppliers);
      setPredictions(results);
      addAuditLog('Prediction Successful', `Generated restock predictions for ${results.length} products.`);

      // Automated reordering logic
      results.forEach(prediction => {
        const product = products.find(p => p.id === prediction.productId);
        if (!product) return;

        const supplier = suppliers.find(s => s.id === product.supplierId);
        if (!supplier || !supplier.quickReorderEnabled || prediction.urgency !== 'High') {
            return;
        }
        
        // Avoid flagging again if we just did
        const recentFlagLog = auditLogs.find(log => 
            log.action === 'Reorder Suggested' &&
            log.details.includes(`product "${product.name}"`) &&
            new Date().getTime() - new Date(log.timestamp).getTime() < 1000 * 60 * 60 // 1 hour cooldown
        );

        if (!recentFlagLog) {
            addAuditLog(
                'Reorder Suggested',
                `High urgency for product "${product.name}". Suggested for admin review for supplier "${supplier.name}".`,
                { productId: product.id }
            );
        }
      });

    } catch (error) {
      console.error("Failed to get restock predictions", error);
      addAuditLog('Prediction Failed', 'Failed to get restock predictions from Gemini API.');
    } finally {
      setIsPredictionsLoading(false);
    }
  }, [products, branches, suppliers, addAuditLog, isPredictionsLoading, auditLogs]);

  useEffect(() => {
    if (currentUser && products.length > 0) {
      runRestockPredictions();
    }
  }, [currentUser, products.length, runRestockPredictions]);

  // Redirect non-admins from admin pages
  useEffect(() => {
    const adminPages = ['Suppliers', 'Supplier Insights', 'Clinic Admin', 'User Admin', 'Audit Log'];
    const staffPages = ['Inventory History'];

    if (currentUser?.role !== 'Admin' && adminPages.includes(currentPage)) {
        setCurrentPage('Dashboard');
    }
    if (currentUser?.role === 'Admin' && staffPages.includes(currentPage)) {
        setCurrentPage('Dashboard');
    }

  }, [currentUser, currentPage]);


  // --- Memoized Derived State ---

  const inventoryData: InventoryItem[] = useMemo(() => {
    return products.map(p => {
      const prediction = predictions.find(pred => pred.productId === p.id);
      const totalStock = p.stockLevels.reduce((sum, sl) => sl.batches.reduce((batchSum, batch) => batchSum + batch.quantity, 0) + sum, 0);
      return { ...p, ...prediction, totalStock };
    });
  }, [products, predictions]);
  
  const filteredInventoryForView = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') return inventoryData;
    
    // Staff view: filter and reshape data
    return inventoryData.map(item => {
        const branchStockLevel = item.stockLevels.find(sl => sl.branchId === currentUser.branchId);
        const branchTotalStock = branchStockLevel ? branchStockLevel.batches.reduce((sum, batch) => sum + batch.quantity, 0) : 0;
        return {
          ...item,
          totalStock: branchTotalStock, // totalStock now means branchStock
          stockLevels: branchStockLevel ? [branchStockLevel] : [],
        };
      });
  }, [currentUser, inventoryData]);

  const highUrgencyAlerts = useMemo(() => {
      return filteredInventoryForView.filter(item => item.urgency === 'High' && !acknowledgedAlerts.includes(item.id));
  }, [filteredInventoryForView, acknowledgedAlerts]);
  
  // --- Dashboard Analytics ---
  const dashboardFilteredData = useMemo(() => {
    if (dashboardBranchId === 'all') return inventoryData;
    return inventoryData.map(item => {
      const branchStockLevel = item.stockLevels.find(sl => sl.branchId === dashboardBranchId);
      const branchTotalStock = branchStockLevel ? branchStockLevel.batches.reduce((sum, batch) => sum + batch.quantity, 0) : 0;
      return {
        ...item,
        totalStock: branchTotalStock,
        stockLevels: branchStockLevel ? [branchStockLevel] : [],
      };
    }).filter(item => item.totalStock > 0);
  }, [inventoryData, dashboardBranchId]);
  
  const usageByProduct = useMemo(() => {
    const usageMap = new Map<string, number>();
    const days = parseInt(dashboardDateRange, 10);
    products.forEach(p => {
      let totalUsage = 0;
      p.historicalUsage.forEach(hs => {
        if(dashboardBranchId === 'all' || hs.branchId === dashboardBranchId) {
          totalUsage += hs.usage.slice(-days).reduce((a: number, b: number) => a + b, 0);
        }
      });
      usageMap.set(p.id, totalUsage);
    });
    return usageMap;
  }, [products, dashboardDateRange, dashboardBranchId]);

  const topSlowMovers = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => (usageByProduct.get(b.id) ?? 0) - (usageByProduct.get(a.id) ?? 0));
    return {
      top: sortedProducts.slice(0, 5),
      slow: sortedProducts.slice(-5).reverse(),
    };
  }, [products, usageByProduct]);

  const expiringSoonItems = useMemo(() => {
    const items = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const product of products) {
        for (const stockLevel of product.stockLevels) {
            for (const batch of stockLevel.batches) {
                if (batch.expiryDate) {
                    const expiry = new Date(batch.expiryDate);
                    const expiryDayEnd = new Date(expiry);
                    expiryDayEnd.setHours(23, 59, 59, 999);

                    if (expiryDayEnd >= today && expiry <= thirtyDaysFromNow) {
                        const timeDiff = expiry.getTime() - today.getTime();
                        const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        const branch = branches.find(b => b.id === stockLevel.branchId);
                        items.push({
                            productId: product.id,
                            productName: product.name,
                            branchId: stockLevel.branchId,
                            branchName: branch ? branch.name : 'Unknown Clinic',
                            quantity: batch.quantity,
                            expiryDate: batch.expiryDate,
                            daysUntilExpiry: daysUntilExpiry >= 0 ? daysUntilExpiry : 0,
                        });
                    }
                }
            }
        }
    }
    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [products, branches]);
  
  const dashboardKpis = useMemo(() => {
    const totalInventoryValue = dashboardFilteredData.reduce((sum: number, item) => sum + (item.totalStock * (item.purchasePrice ?? 0)), 0);
    
    const totalUsageValue = Array.from(usageByProduct.entries()).reduce((sum: number, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (quantity * (product?.purchasePrice ?? 0));
    }, 0);

    const stockTurnover = totalInventoryValue > 0 ? totalUsageValue / totalInventoryValue : 0;

    return { totalInventoryValue, stockTurnover };
  }, [dashboardFilteredData, products, usageByProduct]);
  
  const branchPerformanceData: BranchPerformance[] = useMemo(() => branches.map(branch => {
        const branchProducts = inventoryData.filter(item => item.stockLevels.some(sl => sl.branchId === branch.id && sl.batches.some(b => b.quantity > 0)));
        const totalStockUnits = branchProducts.reduce((sum, item) => {
            const branchLevel = item.stockLevels.find(sl => sl.branchId === branch.id);
            return sum + (branchLevel ? branchLevel.batches.reduce((bs, b) => bs + b.quantity, 0) : 0);
        }, 0);
        const branchMinStock = (item: InventoryItem) => item.stockLevels.find(sl => sl.branchId === branch.id)?.batches.reduce((t, b) => t + b.quantity, 0) ?? 0;

        return {
            branchId: branch.id, branchName: branch.name, totalProducts: branchProducts.length,
            totalStockUnits: totalStockUnits,
            highUrgencyAlerts: inventoryData.filter(a => a.urgency === 'High' && (a.branchSuggestions?.some(bs => bs.branchId === branch.id) || branchMinStock(a) < (a.minStockLevel ?? 50))).length,
            topUsedItem: [...products].sort((a, b) => {
                const usageA = a.historicalUsage.find(s => s.branchId === branch.id)?.usage.reduce((sum: number, s: number) => sum + s, 0) || 0;
                const usageB = b.historicalUsage.find(s => s.branchId === branch.id)?.usage.reduce((sum: number, s: number) => sum + s, 0) || 0;
                return usageB - usageA;
            })[0]
        };
  }), [branches, inventoryData, products]);

  const performanceDataForView = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') {
        return branchPerformanceData;
    }
    return branchPerformanceData.filter(p => p.branchId === currentUser.branchId);
  }, [currentUser, branchPerformanceData]);


  // --- Event Handlers ---

  const handleLogin = useCallback((username: string, password: string, onError: (message: string) => void) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        setCurrentUser(user);
        addAuditLog('User Login', `User "${user.name}" logged in.`);
    } else {
        onError('Invalid username or password.');
    }
  }, [users, addAuditLog]);
  
  const handleLogout = () => {
    if (currentUser) {
        addAuditLog('User Logout', `User "${currentUser.name}" logged out.`);
    }
    setCurrentUser(null);
    setPredictions([]);
    setCurrentPage('Dashboard');
    setAcknowledgedAlerts([]);
  };
  
  const handleAcknowledge = useCallback((productId: string) => {
    setAcknowledgedAlerts(prev => [...prev, productId]);
    addAuditLog('Alert Acknowledged', `Alert for product ${productId} acknowledged.`, { productId });
  }, [addAuditLog]);

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'historicalUsage' | 'historicalPrices'> & { stockLevels: StockLevel[] }) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${uuidv4()}`,
      stockLevels: newProductData.stockLevels,
      historicalUsage: branches.map(b => ({ branchId: b.id, usage: Array(7).fill(0) })),
      historicalPrices: [{ date: new Date().toISOString().split('T')[0], price: newProductData.purchasePrice || 0 }]
    };
    setProducts(prev => {
        const updatedProducts = [...prev, newProduct];
        putAllData('products', updatedProducts).catch(err => console.error("Failed to save products to DB", err));
        return updatedProducts;
    });
    addAuditLog('Product Added', `New product "${newProduct.name}" created.`);
    setModal(null);
  };
  
  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => {
        const updatedProducts = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        putAllData('products', updatedProducts).catch(err => console.error("Failed to save products to DB", err));
        return updatedProducts;
    });
    addAuditLog('Product Edited', `Product "${updatedProduct.name}" (ID: ${updatedProduct.id}) updated.`, { productId: updatedProduct.id });
    setModal(null);
  };
  
  const handleDeleteProduct = (productId: string) => {
      const productName = products.find(p => p.id === productId)?.name;
      if (window.confirm(`Are you sure you want to delete the product "${productName}"? This action cannot be undone.`)) {
          setProducts(prev => {
              const updatedProducts = prev.filter(p => p.id !== productId);
              putAllData('products', updatedProducts).catch(err => console.error("Failed to delete product from DB", err));
              return updatedProducts;
          });
          addAuditLog('Product Deleted', `Product "${productName}" (ID: ${productId}) was deleted.`, { productId });
      }
  };

  const handleCreateUser = (newUserData: Omit<User, 'id'>) => {
      const newUser: User = { ...newUserData, id: `user-${uuidv4()}` };
      setUsers(prev => {
          const updatedUsers = [...prev, newUser];
          putAllData('users', updatedUsers).catch(err => console.error("Failed to save users to DB", err));
          return updatedUsers;
      });
      const branchInfo = newUser.branchId ? ` for clinic ${branches.find(b => b.id === newUser.branchId)?.name}` : '';
      addAuditLog('User Created', `New ${newUser.role} user "${newUser.name}" created${branchInfo}.`);
  };

  const handleDeleteUser = (userId: string) => {
      if (currentUser?.id === userId) {
          alert("You cannot delete your own account.");
          return;
      }
      const userName = users.find(u => u.id === userId)?.name;
      if (window.confirm(`Are you sure you want to delete the user "${userName}"?`)) {
          setUsers(prev => {
              const updatedUsers = prev.filter(u => u.id !== userId);
              putAllData('users', updatedUsers).catch(err => console.error("Failed to delete user from DB", err));
              return updatedUsers;
          });
          addAuditLog('User Deleted', `User "${userName}" (ID: ${userId}) was deleted.`);
      }
  };

  const handleBatchesUpdate = (productId: string, branchId: string, newBatches: StockBatch[], reason: string) => {
    setProducts(prev => {
        const updatedProducts = prev.map(p => {
            if (p.id !== productId) return p;
            const otherStockLevels = p.stockLevels.filter(sl => sl.branchId !== branchId);
            return {
                ...p,
                stockLevels: [...otherStockLevels, { branchId, batches: newBatches }]
            };
        });
        putAllData('products', updatedProducts).catch(err => console.error("Failed to update product batches in DB", err));
        return updatedProducts;
    });
    const productName = products.find(p => p.id === productId)?.name;
    const branchName = branches.find(b => b.id === branchId)?.name;
    addAuditLog('Stock Adjusted', `Stock for "${productName}" at ${branchName} updated. Reason: ${reason}.`, { productId, branchId });
    setModal(null);
  };

  const handleStockTransfer = (productId: string, fromBranchId: string, toBranchId:string, batchId: string, amount: number) => {
      setProducts(prev => {
        const newProducts = [...prev];
        const productIndex = newProducts.findIndex(p => p.id === productId);
        if (productIndex === -1) return prev;

        const product = newProducts[productIndex];
        
        // Find source and destination stock levels
        let fromStockLevel = product.stockLevels.find(sl => sl.branchId === fromBranchId);
        let toStockLevel = product.stockLevels.find(sl => sl.branchId === toBranchId);

        if (!fromStockLevel) return prev;
        
        // Find the batch to move and ensure it exists and has enough quantity
        const batchToMove = fromStockLevel.batches.find(b => b.batchId === batchId);
        if (!batchToMove || batchToMove.quantity < amount) return prev; // Safety check
        
        const remainingInBatch = batchToMove.quantity - amount;
        if (remainingInBatch > 0) {
            batchToMove.quantity = remainingInBatch;
        } else {
            fromStockLevel.batches = fromStockLevel.batches.filter(b => b.batchId !== batchId);
        }
        
        // Add to destination
        const newBatchForTo: StockBatch = { ...batchToMove, quantity: amount };
        if (toStockLevel) {
            // Check if a batch with same expiry date exists to merge
            const existingBatchIndex = toStockLevel.batches.findIndex(b => b.expiryDate === newBatchForTo.expiryDate);
            if (existingBatchIndex > -1) {
                toStockLevel.batches[existingBatchIndex].quantity += amount;
            } else {
                toStockLevel.batches.push(newBatchForTo);
            }
        } else {
            // Create new stock level for destination if it doesn't exist
            toStockLevel = { branchId: toBranchId, batches: [newBatchForTo] };
            product.stockLevels.push(toStockLevel);
        }
        putAllData('products', newProducts).catch(err => console.error("Failed to transfer stock in DB", err));
        return newProducts;
      });

      const productName = products.find(p => p.id === productId)?.name;
      const fromName = branches.find(b => b.id === fromBranchId)?.name;
      const toName = branches.find(b => b.id === toBranchId)?.name;
      addAuditLog('Stock Transferred', `${amount} units of "${productName}" from ${fromName} to ${toName}.`, { productId });
      setModal(null);
  };
  
  const handleAddSupplier = (name: string, contactEmail: string) => {
      const newSupplier: Supplier = { id: `sup-${uuidv4()}`, name, contactEmail, quickReorderEnabled: false };
      setSuppliers(prev => {
          const updatedSuppliers = [...prev, newSupplier];
          putAllData('suppliers', updatedSuppliers).catch(err => console.error("Failed to save suppliers to DB", err));
          return updatedSuppliers;
      });
      addAuditLog('Supplier Added', `New supplier "${name}" added.`);
  };
  const handleEditSupplier = (id: string, name: string, contactEmail: string) => {
      setSuppliers(prev => {
          const updatedSuppliers = prev.map(s => s.id === id ? { ...s, name, contactEmail } : s);
          putAllData('suppliers', updatedSuppliers).catch(err => console.error("Failed to save suppliers to DB", err));
          return updatedSuppliers;
      });
      addAuditLog('Supplier Edited', `Supplier ID "${id}" details updated.`);
  };
  const handleDeleteSupplier = (supplierId: string) => {
      if (products.some(p => p.supplierId === supplierId)) {
          alert('Cannot delete this supplier. It is currently associated with one or more products. Please reassign products first.');
          return;
      }
      const supplierName = suppliers.find(s => s.id === supplierId)?.name;
      if (window.confirm(`Are you sure you want to delete the supplier "${supplierName}"?`)) {
          setSuppliers(prev => {
              const updatedSuppliers = prev.filter(s => s.id !== supplierId);
              putAllData('suppliers', updatedSuppliers).catch(err => console.error("Failed to delete supplier from DB", err));
              return updatedSuppliers;
          });
          addAuditLog('Supplier Deleted', `Supplier "${supplierName}" (ID: ${supplierId}) was deleted.`);
      }
  };
   const handleToggleQuickReorder = (supplierId: string, enabled: boolean) => {
        setSuppliers(prev => {
            const updatedSuppliers = prev.map(s => s.id === supplierId ? { ...s, quickReorderEnabled: enabled } : s);
            putAllData('suppliers', updatedSuppliers).catch(err => console.error("Failed to update supplier in DB", err));
            return updatedSuppliers;
        });
        const supplierName = suppliers.find(s => s.id === supplierId)?.name;
        addAuditLog('Setting Changed', `Quick reorder for supplier "${supplierName}" was ${enabled ? 'enabled' : 'disabled'}.`);
    };
   const handlePlaceReorder = (productId: string, supplierId: string, quantity: number, orderName: string) => {
        const productName = products.find(p => p.id === productId)?.name;
        const supplierName = suppliers.find(s => s.id === supplierId)?.name;
        addAuditLog(
            'Reorder Placed',
            `Order "${orderName}" for ${quantity} units of "${productName}" placed with supplier "${supplierName}".`,
            { productId }
        );
        setModal(null);
    };
  const handleAddBranch = (name: string) => {
      const newBranch: Branch = { id: `branch-${uuidv4()}`, name };
      setBranches(prev => {
          const updatedBranches = [...prev, newBranch];
          putAllData('branches', updatedBranches).catch(err => console.error("Failed to save branches to DB", err));
          return updatedBranches;
      });
      addAuditLog('Clinic Added', `New clinic "${name}" added.`);
  };
  const handleEditBranch = (id: string, newName: string) => {
      setBranches(prev => {
          const updatedBranches = prev.map(b => b.id === id ? { ...b, name: newName } : b);
          putAllData('branches', updatedBranches).catch(err => console.error("Failed to save branches to DB", err));
          return updatedBranches;
      });
      addAuditLog('Clinic Edited', `Clinic ID "${id}" renamed to "${newName}".`);
  };
  const handleDeleteBranch = (branchId: string) => {
      if (products.some(p => p.stockLevels.some(sl => sl.branchId === branchId && sl.batches.reduce((sum, b) => sum + b.quantity, 0) > 0))) {
          alert('Cannot delete this clinic as it has stock. Please transfer or adjust stock to zero first.');
          return;
      }
      if (users.some(u => u.branchId === branchId)) {
          alert('Cannot delete this clinic as it has users assigned to it. Please reassign users first.');
          return;
      }
      const branchName = branches.find(b => b.id === branchId)?.name;
      if (window.confirm(`Are you sure you want to delete the clinic "${branchName}"?`)) {
          setBranches(prev => {
              const updatedBranches = prev.filter(b => b.id !== branchId);
              putAllData('branches', updatedBranches).catch(err => console.error("Failed to delete branch from DB", err));
              return updatedBranches;
          });
          addAuditLog('Clinic Deleted', `Clinic "${branchName}" (ID: ${branchId}) was deleted.`);
      }
  };
  const handleRunPricePrediction = (supplier: Supplier, supplierProducts: Product[]): Promise<PricePredictionResult[]> => {
      return getSupplierPricePrediction(supplier, supplierProducts);
  };

  // --- Render Logic ---

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  const isAdmin = currentUser.role === 'Admin';
  
  const renderPage = () => {
    switch (currentPage) {
        case 'Dashboard':
            return (
              <div className="space-y-6">
                 <DashboardFilters
                    branches={branches}
                    dateRange={dashboardDateRange}
                    setDateRange={setDashboardDateRange}
                    branchId={dashboardBranchId}
                    setBranchId={setDashboardBranchId}
                    isAdmin={isAdmin}
                />
                <DashboardMetrics 
                    data={dashboardFilteredData} 
                    alertCount={highUrgencyAlerts.length}
                    kpis={dashboardKpis}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><TopSlowMovers movers={topSlowMovers} usage={usageByProduct} dateRange={dashboardDateRange} /></div>
                  <div className="space-y-6">
                    <BranchPerformanceOverview performanceData={performanceDataForView} setCurrentPage={setCurrentPage} />
                    <ExpiryAlertsCard expiringItems={expiringSoonItems} />
                  </div>
                </div>
              </div>
            );
        case 'Supplies':
            return (
                 <div className="space-y-6">
                    <InventoryTable inventory={filteredInventoryForView} branches={branches} suppliers={suppliers} currentUser={currentUser}
                        onAdjustStock={(p) => { setSelectedProduct(p); setModal('adjust'); }}
                        onTransferStock={(p) => { setSelectedProduct(p); setModal('transfer'); }}
                        onShowQR={(p) => { setSelectedProduct(p); setModal('qr'); }}
                        onEditProduct={(p) => { setSelectedProduct(p); setModal('edit'); }}
                        onDeleteProduct={handleDeleteProduct}
                        onAddNewSupplyClick={() => setModal('add')}
                    />
                    <SuggestionCards
                        suggestions={filteredInventoryForView.filter(item => !acknowledgedAlerts.includes(item.id))}
                        branches={branches}
                        suppliers={suppliers}
                        currentUser={currentUser}
                        onAcknowledge={handleAcknowledge}
                        onPrepareReorder={(p) => { setSelectedProduct(p); setModal('reorder'); }}
                    />
                </div>
            );
        case 'Suppliers': return isAdmin ? <SupplierManager 
            suppliers={suppliers} 
            inventory={inventoryData}
            onAddSupplier={handleAddSupplier} 
            onEditSupplier={handleEditSupplier} 
            onDeleteSupplier={handleDeleteSupplier} 
            onToggleQuickReorder={handleToggleQuickReorder} 
            onPrepareReorder={(p) => { setSelectedProduct(p); setModal('reorder'); }}
            currentUser={currentUser} /> : null;
        case 'Supplier Insights': return isAdmin ? <SupplierInsights suppliers={suppliers} products={products} onRunPrediction={handleRunPricePrediction} addAuditLog={addAuditLog} /> : null;
        case 'Audit Log':
        case 'Inventory History': 
            return <InventoryHistoryView 
                        logs={auditLogs} 
                        currentUser={currentUser} 
                        products={products}
                        branches={branches}
                    />;
        case 'Clinic Admin': return isAdmin ? <ClinicAdmin performanceData={branchPerformanceData} onAddClinic={handleAddBranch} onEditClinic={handleEditBranch} onDeleteClinic={handleDeleteBranch} /> : null;
        case 'User Admin': return isAdmin ? <UserAdmin users={users} branches={branches} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} currentUser={currentUser} /> : null;
        default: return <p>Page not found.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-200 relative lg:flex">
        <Sidebar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            isMobileOpen={isMobileSidebarOpen}
            setMobileOpen={setIsMobileSidebarOpen}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-screen lg:pl-24">
            <Header currentPage={currentPage} onMenuClick={() => setIsMobileSidebarOpen(true)} />
            <div className="mt-6">{isLoading ? <p>Loading...</p> : renderPage()}</div>
        </main>

        {/* Overlay for mobile sidebar */}
        {isMobileSidebarOpen && (
            <div 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                aria-hidden="true"
            ></div>
        )}

        <Chatbot inventoryData={inventoryData} suppliers={suppliers} branches={branches} />

        {/* Modals */}
        {modal === 'adjust' && selectedProduct && <StockAdjustmentModal product={selectedProduct} branches={branches} onClose={() => setModal(null)} onBatchesUpdate={handleBatchesUpdate} currentUser={currentUser} />}
        {modal === 'transfer' && selectedProduct && <StockTransferModal product={selectedProduct} branches={branches} onClose={() => setModal(null)} onTransfer={handleStockTransfer} currentUser={currentUser}/>}
        {modal === 'qr' && selectedProduct && <QRCodeModal product={selectedProduct} onClose={() => setModal(null)} />}
        {modal === 'edit' && selectedProduct && <EditProductModal product={selectedProduct} suppliers={suppliers} branches={branches} onClose={() => setModal(null)} onSave={handleEditProduct} />}
        {modal === 'reorder' && selectedProduct && <ReorderModal product={selectedProduct} onClose={() => setModal(null)} onReorder={handlePlaceReorder} />}
        {modal === 'add' && <AddProductModal onClose={() => setModal(null)} onAddProduct={handleAddProduct} suppliers={suppliers} branches={branches} currentUser={currentUser} />}
    </div>
  );
}

export default App;
