
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Product, Branch, Supplier, InventoryItem, PredictionResult, PricePredictionResult, BranchPerformance, AuditLog, User, StockLevel } from './types';

// Mock data and services
import { PRODUCTS, BRANCHES, SUPPLIERS, USERS } from './data';
import { getRestockPredictions, getSupplierPricePrediction } from './services/geminiService';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './LoginPage';
import DashboardMetrics from './components/DashboardMetrics';
import InventoryTable from './components/InventoryTable';
import AddProductForm from './components/AddProductForm';
import SupplierManager from './components/SupplierManager';
import AuditLogView from './components/AuditLogView';
import Chatbot from './components/Chatbot';
import SupplierInsights from './components/SupplierInsights';
import BranchAdmin from './components/BranchAdmin';
import UserAdmin from './components/UserAdmin';
import SuggestionCards from './components/SuggestionCards';
import DashboardFilters from './components/DashboardFilters';
import TopSlowMovers from './components/TopSlowMovers';
import BranchPerformanceOverview from './components/BranchPerformanceOverview';


// Modals
import StockAdjustmentModal from './components/StockAdjustmentModal';
import StockTransferModal from './components/StockTransferModal';
import QRCodeModal from './components/QRCodeModal';
import EditProductModal from './components/EditProductModal';

const App: React.FC = () => {
  // Authentication and User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);

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
  const [modal, setModal] = useState<'adjust' | 'transfer' | 'qr' | 'edit' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  
  // Dashboard Filter State
  const [dashboardDateRange, setDashboardDateRange] = useState('30'); // '7', '30', '90', '365'
  const [dashboardBranchId, setDashboardBranchId] = useState('all');

  // --- Data & Auth ---
  
  const addAuditLog = useCallback((action: string, details: string) => {
    setAuditLogs(prev => [
      { id: uuidv4(), timestamp: new Date().toISOString(), action, details },
      ...prev
    ]);
  }, []);

  useEffect(() => {
    setProducts(PRODUCTS);
    setBranches(BRANCHES);
    setSuppliers(SUPPLIERS);
    addAuditLog('System Startup', 'Application initialized and mock data loaded.');
    setIsLoading(false);
  }, [addAuditLog]);

  const runRestockPredictions = useCallback(async () => {
    if (isPredictionsLoading || products.length === 0 || branches.length === 0 || suppliers.length === 0) return;
    setIsPredictionsLoading(true);
    addAuditLog('Prediction Started', 'Restock prediction analysis initiated.');
    try {
      const results = await getRestockPredictions(products, branches, suppliers);
      setPredictions(results);
      addAuditLog('Prediction Successful', `Generated restock predictions for ${results.length} products.`);
    } catch (error) {
      console.error("Failed to get restock predictions", error);
      addAuditLog('Prediction Failed', 'Failed to get restock predictions from Gemini API.');
    } finally {
      setIsPredictionsLoading(false);
    }
  }, [products, branches, suppliers, addAuditLog, isPredictionsLoading]);

  useEffect(() => {
    if (currentUser && products.length > 0) {
      runRestockPredictions();
    }
  }, [currentUser, products.length, runRestockPredictions]);

  // --- Memoized Derived State ---

  const inventoryData: InventoryItem[] = useMemo(() => {
    return products.map(p => {
      const prediction = predictions.find(pred => pred.productId === p.id);
      const totalStock = p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
      return { ...p, ...prediction, totalStock };
    });
  }, [products, predictions]);
  
  const filteredInventoryForView = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') return inventoryData;
    
    // Staff view: filter and reshape data
    return inventoryData.map(item => {
        const branchStock = item.stockLevels.find(sl => sl.branchId === currentUser.branchId);
        return {
          ...item,
          totalStock: branchStock?.quantity ?? 0, // totalStock now means branchStock
          stockLevels: branchStock ? [branchStock] : [],
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
      const branchStock = item.stockLevels.find(sl => sl.branchId === dashboardBranchId);
      return {
        ...item,
        totalStock: branchStock?.quantity ?? 0,
        stockLevels: branchStock ? [branchStock] : [],
      };
    }).filter(item => item.totalStock > 0);
  }, [inventoryData, dashboardBranchId]);
  
  const salesByProduct = useMemo(() => {
    const salesMap = new Map<string, number>();
    const days = parseInt(dashboardDateRange, 10);
    products.forEach(p => {
      let totalSales = 0;
      p.historicalSales.forEach(hs => {
        if(dashboardBranchId === 'all' || hs.branchId === dashboardBranchId) {
          totalSales += hs.sales.slice(-days).reduce((a, b) => a + b, 0);
        }
      });
      salesMap.set(p.id, totalSales);
    });
    return salesMap;
  }, [products, dashboardDateRange, dashboardBranchId]);

  const topSlowMovers = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => (salesByProduct.get(b.id) ?? 0) - (salesByProduct.get(a.id) ?? 0));
    return {
      top: sortedProducts.slice(0, 5),
      slow: sortedProducts.slice(-5).reverse(),
    };
  }, [products, salesByProduct]);
  
  const dashboardKpis = useMemo(() => {
    const totalInventoryValue = dashboardFilteredData.reduce((sum, item) => sum + (item.totalStock * (item.purchasePrice ?? 0)), 0);
    
    const totalSalesValue = Array.from(salesByProduct.entries()).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (quantity * (product?.purchasePrice ?? 0));
    }, 0);

    const stockTurnover = totalInventoryValue > 0 ? totalSalesValue / totalInventoryValue : 0;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const nearingExpiryCount = products.reduce((count, p) => {
      const hasExpiringStock = p.stockLevels.some(sl => 
        sl.expiryDate && new Date(sl.expiryDate) <= thirtyDaysFromNow
      );
      return count + (hasExpiringStock ? 1 : 0);
    }, 0);

    return { totalInventoryValue, stockTurnover, nearingExpiryCount };
  }, [dashboardFilteredData, products, salesByProduct]);
  
  const branchPerformanceData: BranchPerformance[] = useMemo(() => branches.map(branch => {
        const branchProducts = inventoryData.filter(item => item.stockLevels.some(sl => sl.branchId === branch.id && sl.quantity > 0));
        return {
            branchId: branch.id, branchName: branch.name, totalProducts: branchProducts.length,
            totalStockUnits: branchProducts.reduce((sum, item) => sum + (item.stockLevels.find(sl => sl.branchId === branch.id)?.quantity || 0), 0),
            highUrgencyAlerts: inventoryData.filter(a => a.urgency === 'High' && (a.branchSuggestions?.some(bs => bs.branchId === branch.id) || (a.stockLevels.find(sl => sl.branchId === branch.id)?.quantity ?? 0) < (a.minStockLevel ?? 50))).length,
            topSeller: products.sort((a, b) => {
                const salesA = a.historicalSales.find(s => s.branchId === branch.id)?.sales.reduce((sum, s) => sum + s, 0) || 0;
                const salesB = b.historicalSales.find(s => s.branchId === branch.id)?.sales.reduce((sum, s) => sum + s, 0) || 0;
                return salesB - salesA;
            })[0]
        };
  }), [branches, inventoryData, products]);


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
    addAuditLog('Alert Acknowledged', `Alert for product ${productId} acknowledged.`);
  }, [addAuditLog]);

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'historicalSales' | 'historicalPrices'> & { stockLevels: StockLevel[] }) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${uuidv4()}`,
      stockLevels: newProductData.stockLevels,
      historicalSales: branches.map(b => ({ branchId: b.id, sales: Array(7).fill(0) })),
      historicalPrices: [{ date: new Date().toISOString().split('T')[0], price: newProductData.purchasePrice || 0 }]
    };
    setProducts(prev => [...prev, newProduct]);
    addAuditLog('Product Added', `New product "${newProduct.name}" created.`);
  };
  
  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addAuditLog('Product Edited', `Product "${updatedProduct.name}" (ID: ${updatedProduct.id}) updated.`);
    setModal(null);
  };
  
  const handleDeleteProduct = (productId: string) => {
      const productName = products.find(p => p.id === productId)?.name;
      if (window.confirm(`Are you sure you want to delete the product "${productName}"? This action cannot be undone.`)) {
          setProducts(prev => prev.filter(p => p.id !== productId));
          addAuditLog('Product Deleted', `Product "${productName}" (ID: ${productId}) was deleted.`);
      }
  };

  const handleCreateUser = (newUserData: Omit<User, 'id'>) => {
      const newUser: User = { ...newUserData, id: `user-${uuidv4()}` };
      setUsers(prev => [...prev, newUser]);
      const branchInfo = newUser.branchId ? ` for branch ${branches.find(b => b.id === newUser.branchId)?.name}` : '';
      addAuditLog('User Created', `New ${newUser.role} user "${newUser.name}" created${branchInfo}.`);
  };

  const handleDeleteUser = (userId: string) => {
      if (currentUser?.id === userId) {
          alert("You cannot delete your own account.");
          return;
      }
      const userName = users.find(u => u.id === userId)?.name;
      if (window.confirm(`Are you sure you want to delete the user "${userName}"?`)) {
          setUsers(prev => prev.filter(u => u.id !== userId));
          addAuditLog('User Deleted', `User "${userName}" (ID: ${userId}) was deleted.`);
      }
  };

  const handleStockAdjustment = (productId: string, branchId: string, newQuantity: number, reason: string) => {
    setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stockLevels: p.stockLevels.map(sl => sl.branchId === branchId ? { ...sl, quantity: newQuantity } : sl) } : p
    ));
    addAuditLog('Stock Adjusted', `Product ID ${productId} at Branch ID ${branchId} set to ${newQuantity}. Reason: ${reason}.`);
    setModal(null);
  };

  const handleStockTransfer = (productId: string, fromBranchId: string, toBranchId:string, amount: number) => {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockLevels: p.stockLevels.map(sl => {
          if(sl.branchId === fromBranchId) return { ...sl, quantity: sl.quantity - amount };
          if(sl.branchId === toBranchId) return { ...sl, quantity: sl.quantity + amount };
          return sl;
      })} : p));
      addAuditLog('Stock Transferred', `${amount} units of Product ID ${productId} from ${fromBranchId} to ${toBranchId}.`);
      setModal(null);
  };
  
  const handleAddSupplier = (name: string, contactEmail: string) => {
      const newSupplier: Supplier = { id: `sup-${uuidv4()}`, name, contactEmail };
      setSuppliers(prev => [...prev, newSupplier]);
      addAuditLog('Supplier Added', `New supplier "${name}" added.`);
  };
  const handleEditSupplier = (id: string, name: string, contactEmail: string) => {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, name, contactEmail } : s));
      addAuditLog('Supplier Edited', `Supplier ID "${id}" details updated.`);
  };
  const handleDeleteSupplier = (supplierId: string) => {
      if (products.some(p => p.supplierId === supplierId)) {
          alert('Cannot delete this supplier. It is currently associated with one or more products. Please reassign products first.');
          return;
      }
      const supplierName = suppliers.find(s => s.id === supplierId)?.name;
      if (window.confirm(`Are you sure you want to delete the supplier "${supplierName}"?`)) {
          setSuppliers(prev => prev.filter(s => s.id !== supplierId));
          addAuditLog('Supplier Deleted', `Supplier "${supplierName}" (ID: ${supplierId}) was deleted.`);
      }
  };
  const handleAddBranch = (name: string) => {
      const newBranch: Branch = { id: `branch-${uuidv4()}`, name };
      setBranches(prev => [...prev, newBranch]);
      addAuditLog('Branch Added', `New branch "${name}" added.`);
  };
  const handleEditBranch = (id: string, newName: string) => {
      setBranches(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
      addAuditLog('Branch Edited', `Branch ID "${id}" renamed to "${newName}".`);
  };
  const handleDeleteBranch = (branchId: string) => {
      if (products.some(p => p.stockLevels.some(sl => sl.branchId === branchId && sl.quantity > 0))) {
          alert('Cannot delete this branch as it has stock. Please transfer or adjust stock to zero first.');
          return;
      }
      if (users.some(u => u.branchId === branchId)) {
          alert('Cannot delete this branch as it has users assigned to it. Please reassign users first.');
          return;
      }
      const branchName = branches.find(b => b.id === branchId)?.name;
      if (window.confirm(`Are you sure you want to delete the branch "${branchName}"?`)) {
          setBranches(prev => prev.filter(b => b.id !== branchId));
          addAuditLog('Branch Deleted', `Branch "${branchName}" (ID: ${branchId}) was deleted.`);
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
                  <div className="lg:col-span-2"><TopSlowMovers movers={topSlowMovers} sales={salesByProduct} dateRange={dashboardDateRange} /></div>
                  <div><BranchPerformanceOverview performanceData={branchPerformanceData} /></div>
                </div>
              </div>
            );
        case 'Supplies':
            return (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        <div className="xl:col-span-3">
                           <InventoryTable inventory={filteredInventoryForView} branches={branches} suppliers={suppliers} currentUser={currentUser}
                               onAdjustStock={(p) => { setSelectedProduct(p); setModal('adjust'); }}
                               onTransferStock={(p) => { setSelectedProduct(p); setModal('transfer'); }}
                               onShowQR={(p) => { setSelectedProduct(p); setModal('qr'); }}
                               onEditProduct={(p) => { setSelectedProduct(p); setModal('edit'); }}
                               onDeleteProduct={handleDeleteProduct}
                           />
                        </div>
                        <div className="xl:col-span-1"><AddProductForm onAddProduct={handleAddProduct} suppliers={suppliers} branches={branches} currentUser={currentUser} /></div>
                    </div>
                    <SuggestionCards
                        suggestions={filteredInventoryForView.filter(item => !acknowledgedAlerts.includes(item.id))}
                        branches={branches}
                        onAcknowledge={handleAcknowledge}
                    />
                </div>
            );
        case 'Suppliers': return <SupplierManager suppliers={suppliers} onAddSupplier={handleAddSupplier} onEditSupplier={handleEditSupplier} onDeleteSupplier={handleDeleteSupplier} />;
        case 'Supplier Insights': return <SupplierInsights suppliers={suppliers} products={products} onRunPrediction={handleRunPricePrediction} addAuditLog={addAuditLog} />;
        case 'Audit Log': return <AuditLogView logs={auditLogs} />;
        case 'Branch Admin': return isAdmin ? <BranchAdmin performanceData={branchPerformanceData} onAddBranch={handleAddBranch} onEditBranch={handleEditBranch} onDeleteBranch={handleDeleteBranch} /> : null;
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
        {modal === 'adjust' && selectedProduct && <StockAdjustmentModal product={selectedProduct} branches={branches} onClose={() => setModal(null)} onAdjust={handleStockAdjustment} currentUser={currentUser} />}
        {modal === 'transfer' && selectedProduct && <StockTransferModal product={selectedProduct} branches={branches} onClose={() => setModal(null)} onTransfer={handleStockTransfer} currentUser={currentUser}/>}
        {modal === 'qr' && selectedProduct && <QRCodeModal product={selectedProduct} onClose={() => setModal(null)} />}
        {modal === 'edit' && selectedProduct && <EditProductModal product={selectedProduct} suppliers={suppliers} onClose={() => setModal(null)} onSave={handleEditProduct} />}
    </div>
  );
}

export default App;
