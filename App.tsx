import React, { useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, CartItem, Customer, Sale, View, Supplier, PurchaseOrder, SupplierInvoice, SupplierPayment, Role, User, SaleData, Settings, ToastData, AuditLog, Permission, Quotation, PurchaseOrderData, Shift, Payment, PurchaseOrderItem } from './types';
import { MOCK_CUSTOMERS, MOCK_USERS, DEFAULT_SETTINGS, MOCK_AUDIT_LOGS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useThemeManager } from './hooks/useThemeManager';
import * as db from './utils/offlineDb';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PosView from './components/PosView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import PurchasesView from './components/PurchasesView';
import AccountsPayableView from './components/AccountsPayableView';
import TaxReportView from './components/TaxReportView';
import ShiftReportView from './components/ShiftReportView';
import SettingsView from './components/SettingsView';
import Toast from './components/common/Toast';
import CustomersView from './components/CustomersView';
import QuotationsView from './components/QuotationsView';
import AuthView from './components/AuthView';
import ConfirmationModal from './components/common/ConfirmationModal';
import ReceivePOModal from './components/purchases/ReceivePOModal';
import AddToPOModal from './components/modals/AddToPOModal';
import CreateQuotationForm from './components/quotations/CreateQuotationForm';
import QuotationDetailView from './components/quotations/QuotationDetailView';
import { round, getPriceBreakdown } from './utils/vatCalculator';
import EmailModal from './components/modals/EmailModal';
import WhatsAppModal from './components/modals/WhatsAppModal';
import SetupWizard from './components/setup/SetupWizard';

const AnimatedView = ({ children }: { children: ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="absolute top-0 left-0 w-full h-full"
    >
      {children}
    </motion.div>
);


const App = () => {
    // --- Theming Hook ---
    const { currentEvent } = useThemeManager();

    // --- App State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<View>(View.POS);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastData[]>([]);

    // --- Persisted Data State using LocalStorage ---
    const [products, setProducts] = useLocalStorage<Product[]>('kenpos_products', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('kenpos_customers', MOCK_CUSTOMERS);
    const [sales, setSales] = useLocalStorage<Sale[]>('kenpos_sales', []);
    const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('kenpos_suppliers', []);
    const [purchaseOrders, setPurchaseOrders] = useLocalStorage<PurchaseOrder[]>('kenpos_purchaseOrders', []);
    const [supplierInvoices, setSupplierInvoices] = useLocalStorage<SupplierInvoice[]>('kenpos_supplierInvoices', []);
    const [quotations, setQuotations] = useLocalStorage<Quotation[]>('kenpos_quotations', []);
    const [users, setUsers] = useLocalStorage<User[]>('kenpos_users', MOCK_USERS);
    const [settings, setSettings] = useLocalStorage<Settings>('kenpos_settings', DEFAULT_SETTINGS);
    const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('kenpos_auditLogs', MOCK_AUDIT_LOGS);
    const [shifts, setShifts] = useLocalStorage<Shift[]>('kenpos_shifts', []);
    
    // --- Component-specific state ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(MOCK_CUSTOMERS[0]?.id || '');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [isEndingShift, setIsEndingShift] = useState(false);
    const [shiftReportToShow, setShiftReportToShow] = useState<Shift | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [poToReceive, setPoToReceive] = useState<PurchaseOrder | null>(null);
    const [productForPO, setProductForPO] = useState<Product | null>(null);
    const [isCreateQuoteModalOpen, setIsCreateQuoteModalOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [originatingQuoteId, setOriginatingQuoteId] = useState<string | null>(null);
    const [emailInfo, setEmailInfo] = useState<{ documentType: 'Receipt' | 'Quotation' | 'Proforma-Invoice', documentId: string, customerId: string } | null>(null);
    const [whatsAppInfo, setWhatsAppInfo] = useState<{ mode: 'receipt' | 'bulk', customerId?: string, documentId?: string } | null>(null);


    // --- Offline Management ---
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queuedOrderCount, setQueuedOrderCount] = useState(0);

    // --- Utility Functions ---
    const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
        const newToast: ToastData = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 3000);
    }, []);

    const addAuditLog = useCallback((action: string, details: string) => {
        const user = currentUser; // Capture currentUser at the time of calling
        if (!user) return;
        const newLog: AuditLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            userId: user.id,
            userName: user.name,
            action,
            details
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, [currentUser, setAuditLogs]);

    const updateQueuedCount = useCallback(async () => {
        try {
            const count = await db.getQueuedOrderCount();
            setQueuedOrderCount(count);
        } catch (e) {
            console.error("Failed to update queued count:", e);
        }
    }, []);

    useEffect(() => {
        const initializeApp = async () => {
            await db.initDB();

            // Rehydrate cart from IndexedDB
            const storedCart = await db.getCart();
            if (storedCart.length > 0) {
                setCart(storedCart);
            }
            
            await updateQueuedCount();
        };

        initializeApp();

        const handleOnline = async () => {
            setIsOnline(true);
            showToast('You are back online. Syncing pending sales...', 'info');
            const { success, failed } = await db.syncPendingOrders();
            if (success > 0) {
                showToast(`Successfully synced ${success} offline sales.`, 'success');
            }
            if (failed > 0) {
                showToast(`Failed to sync ${failed} sales. Will retry later.`, 'error');
            }
            await updateQueuedCount();
        };

        const handleOffline = () => {
            setIsOnline(false);
            showToast('You are now offline. Sales will be queued.', 'info');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast, updateQueuedCount]);
    
    // --- Core Business Logic Handlers ---

    // Auth & User Management
    const handleSignUp = (userData: Omit<User, 'id' | 'role'>): boolean => {
        // This function is for the public-facing sign-up page.
        // It should only ever create the FIRST user, who becomes the Admin.
        if (users.length > 0) {
            showToast("New accounts must be created by a logged-in administrator.", "error");
            return false;
        }

        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}`,
            role: 'Admin', // The first user is always an Admin.
        };
        
        setUsers([newUser]); // Set the first user, replacing MOCK_USERS if any.
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        
        const newLog: AuditLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            userId: newUser.id,
            userName: newUser.name,
            action: 'INITIAL_ADMIN_SIGNUP',
            details: `Initial admin user ${newUser.name} created.`
        };
        setAuditLogs(prev => [newLog, ...prev]);

        showToast(`Welcome, ${newUser.name}! Your admin account is ready.`, 'success');
        return true;
    };

    const handleLogin = (email: string, password: string): boolean => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            addAuditLog('USER_LOGIN', `User ${user.name} logged in.`);
            showToast(`Welcome, ${user.name}!`, 'success');
            return true;
        } else {
            showToast('Invalid email or password.', 'error');
            return false;
        }
    };

    const handleLogout = () => {
        if (activeShift) {
            showToast("Cannot log out during an active shift. Please end your shift first.", "error");
            return;
        }
        addAuditLog('USER_LOGOUT', `User ${currentUser?.name} logged out.`);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setCurrentView(View.POS);
    };

    // Find active shift for current user on load or user change
    useEffect(() => {
        if (currentUser) {
            const foundShift = shifts.find(s => s.userId === currentUser.id && s.status === 'active');
            setActiveShift(foundShift || null);
        } else {
            setActiveShift(null);
        }
    }, [currentUser, shifts]);
    
    // Persist cart to IndexedDB whenever it changes
    useEffect(() => {
        db.saveCart(cart);
    }, [cart]);
    
    // Prevent user from accessing unauthorized views
    useEffect(() => {
        if (!currentUser) return;
        const userPermissions = settings.permissions[currentUser.role];
        const viewPermissionMap: Record<View, Permission | undefined> = {
            [View.POS]: 'view_pos',
            [View.Dashboard]: 'view_dashboard',
            [View.Inventory]: 'view_inventory',
            [View.Purchases]: 'view_purchases',
            [View.AccountsPayable]: 'view_ap',
            [View.TaxReports]: 'view_tax_reports',
            [View.ShiftReport]: 'view_shift_report',
            [View.Customers]: 'view_customers',
            [View.Quotations]: 'view_quotations',
            [View.Settings]: 'view_settings',
        };
        const requiredPermission = viewPermissionMap[currentView];
        if (requiredPermission && !userPermissions.includes(requiredPermission)) {
            showToast("You don't have permission to access this view.", "error");
            setCurrentView(View.POS); // Redirect to a safe default
        }
    }, [currentUser, currentView, settings.permissions, showToast]);
    
     // Reset quotation detail view when switching main views
    useEffect(() => {
        setSelectedQuotation(null);
        if (currentView !== View.POS) {
            setOriginatingQuoteId(null);
        }
    }, [currentView]);


    // Cart Management
    const addToCart = useCallback((product: Product) => {
        if (product.stock <= 0 && product.productType === 'Inventory') {
            showToast(`${product.name} is out of stock.`, 'error');
            return;
        }
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if (product.productType === 'Inventory' && existingItem.quantity >= product.stock) {
                    showToast(`No more stock available for ${product.name}.`, 'error');
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, [showToast]);

    const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        });
    }, []);
    
    const removeFromCart = useCallback((productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setSelectedCustomerId(MOCK_CUSTOMERS[0]?.id || '');
        setOriginatingQuoteId(null);
    }, []);

    // Sale Completion
    const completeSale = useCallback((saleData: SaleData): Sale => {
        if (!activeShift || !currentUser) {
            showToast("Cannot complete sale. No active shift.", "error");
            throw new Error("Cannot complete sale without an active shift or user.");
        }

        const { loyalty } = settings;
        let pointsEarned = 0;
        let pointsBalanceAfter = 0;

        const customerIndex = customers.findIndex(c => c.id === saleData.customerId);
        let customer: Customer | undefined;
        if (customerIndex !== -1) {
            customer = customers[customerIndex];
        }

        if (loyalty.enabled && customer && customer.id !== 'cust001') {
            const amountForPoints = saleData.total - (saleData.pointsValue || 0);
            pointsEarned = Math.floor(amountForPoints / loyalty.pointsPerKsh);
            const currentPoints = customer.loyaltyPoints;
            pointsBalanceAfter = currentPoints - (saleData.pointsUsed || 0) + pointsEarned;
            const updatedCustomer = { ...customer, loyaltyPoints: pointsBalanceAfter };
            setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        }

        const newSale: Sale = {
            ...saleData,
            id: `${settings.receipt.invoicePrefix}${new Date().getTime()}`,
            synced: isOnline,
            cashierId: currentUser.id,
            cashierName: currentUser.name,
            shiftId: activeShift.id,
            pointsEarned,
            pointsBalanceAfter,
            quotationId: originatingQuoteId,
        };
        
        setActiveShift(prev => {
            if (!prev) return null;
            const updatedShift = { ...prev, salesIds: [...prev.salesIds, newSale.id]};
            setShifts(s => s.map(shift => shift.id === updatedShift.id ? updatedShift : shift));
            return updatedShift;
        });

        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newSale.items.forEach(soldItem => {
                if (soldItem.productType === 'Inventory') {
                    const productIndex = newProducts.findIndex(p => p.id === soldItem.id);
                    if (productIndex !== -1) {
                        newProducts[productIndex].stock -= soldItem.quantity;
                    }
                }
            });
            return newProducts;
        });

        if (isOnline) {
             setSales(prevSales => [newSale, ...prevSales]);
        } else {
            db.queueOrder(newSale).then(updateQueuedCount);
        }
        
        addAuditLog('SALE_COMPLETE', `Completed sale ${newSale.id} for ${newSale.total.toFixed(2)}.`);
        clearCart();
        return newSale;
    }, [clearCart, isOnline, currentUser, customers, settings, activeShift, originatingQuoteId, setCustomers, setProducts, setSales, addAuditLog, setShifts, updateQueuedCount]);

    // Shift Management
    const handleStartShift = (startingFloat: number) => {
        if (activeShift || !currentUser) {
            showToast("A shift is already active or user not logged in.", 'error');
            return;
        }
        const newShift: Shift = {
            id: `shift_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            startTime: new Date(),
            status: 'active',
            startingFloat,
            salesIds: [],
        };
        setActiveShift(newShift);
        setShifts(prev => [...prev, newShift]);
        addAuditLog('SHIFT_START', `Shift started with float ${startingFloat.toFixed(2)}.`);
        showToast("Shift started successfully.", 'success');
    };

    const handleEndShift = (actualCashInDrawer: number) => {
        if (!activeShift) {
            showToast("No active shift to end.", 'error');
            return;
        }

        const shiftSales = sales.filter(s => activeShift.salesIds.includes(s.id));
        const paymentBreakdown: { [key in Payment['method']]?: number } = {};
        let cashChange = 0;
        
        shiftSales.forEach(sale => {
            sale.payments.forEach(p => {
                paymentBreakdown[p.method] = (paymentBreakdown[p.method] || 0) + p.amount;
            });
            cashChange += sale.change;
        });

        const expectedCashInDrawer = activeShift.startingFloat + (paymentBreakdown['Cash'] || 0) - cashChange;

        const closedShift: Shift = {
            ...activeShift,
            status: 'closed',
            endTime: new Date(),
            paymentBreakdown,
            totalSales: shiftSales.reduce((sum, s) => sum + s.total, 0),
            expectedCashInDrawer,
            actualCashInDrawer,
            cashVariance: Number((actualCashInDrawer - expectedCashInDrawer).toFixed(2)),
        };

        setShifts(prev => prev.map(s => s.id === closedShift.id ? closedShift : s));
        setActiveShift(null);
        setIsEndingShift(false);
        setShiftReportToShow(closedShift);
        addAuditLog('SHIFT_END', `Shift ended. Variance: ${closedShift.cashVariance?.toFixed(2)}.`);
        showToast("Shift closed successfully.", 'success');
    };

    // Settings & User Admin
    const updateSettings = (newSettings: Partial<Settings>) => {
        const updatedSettings = {...settings, ...newSettings};
        setSettings(updatedSettings);
        addAuditLog('UPDATE_SETTINGS', 'System settings updated.');
        showToast('Settings saved successfully!');
    };
    
    const addUser = (user: Omit<User, 'id'>) => {
        if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
            showToast('A user with this email already exists.', 'error');
            return;
        }
        const newUser: User = { ...user, id: `user_${Date.now()}` };
        setUsers(prev => [...prev, newUser]);
        addAuditLog('ADD_USER', `Added new user: ${user.name} (${user.email}).`);
        showToast('User added successfully!');
    };
    
    const updateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        addAuditLog('UPDATE_USER', `Updated user: ${updatedUser.name}.`);
        showToast('User updated successfully!');
    };

    const deleteUser = (userId: string) => {
        if (userId === currentUser?.id) {
            showToast('Cannot delete the currently logged-in user.', 'error');
            return;
        }
        const userToDelete = users.find(u => u.id === userId);
        const adminUsers = users.filter(u => u.role === 'Admin');
        if (userToDelete && userToDelete.role === 'Admin' && adminUsers.length <= 1) {
            showToast('Cannot delete the last Admin user.', 'error');
            return;
        }

        setUsers(prev => prev.filter(u => u.id !== userId));
        addAuditLog('DELETE_USER', `Deleted user: ${userToDelete?.name || userId}.`);
        showToast('User deleted successfully!');
    };

    // Product Management
    const addProduct = useCallback((productData: Omit<Product, 'id' | 'stock'>): Product => {
        const newProduct: Product = {
            ...productData,
            id: `prod_${new Date().getTime()}`,
            stock: productData.productType === 'Service' ? 99999 : 0, // New products start with 0 stock unless service
            unitOfMeasure: productData.unitOfMeasure || 'pc(s)',
        };
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        addAuditLog('ADD_PRODUCT', `Created product: ${newProduct.name} (SKU: ${newProduct.sku})`);
        showToast('New product created successfully!', 'success');
        return newProduct;
    }, [showToast, setProducts, addAuditLog]);

    const updateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prevProducts => 
            prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
        addAuditLog('UPDATE_PRODUCT', `Updated product: ${updatedProduct.name} (ID: ${updatedProduct.id})`);
        showToast('Product updated successfully!', 'success');
    }, [setProducts, addAuditLog, showToast]);
    
    const deleteProduct = useCallback(() => {
        if (!productToDelete) return;
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        addAuditLog('DELETE_PRODUCT', `Deleted product: ${productToDelete.name} (ID: ${productToDelete.id})`);
        showToast('Product deleted successfully!', 'success');
        setProductToDelete(null);
    }, [productToDelete, setProducts, addAuditLog, showToast]);

    const handleImportProducts = (importedProducts: Omit<Product, 'id' | 'stock'>[]) => {
        let updatedCount = 0;
        let addedCount = 0;

        const updatedProductList = [...products];
        const productSkuMap = new Map(updatedProductList.map((p, index) => [p.sku, { product: p, index }]));

        importedProducts.forEach(newProd => {
            const existing = productSkuMap.get(newProd.sku);
            if (existing) {
                // Update existing product
                const existingProductWithStock = { ...updatedProductList[existing.index] };
                updatedProductList[existing.index] = { 
                    ...existingProductWithStock, 
                    ...newProd,
                    unitOfMeasure: newProd.unitOfMeasure || 'pc(s)',
                };
                updatedCount++;
            } else {
                // Add new product
                const newProductWithId: Product = {
                    ...newProd,
                    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    stock: newProd.productType === 'Service' ? 99999 : 0,
                    unitOfMeasure: newProd.unitOfMeasure || 'pc(s)',
                };
                updatedProductList.push(newProductWithId);
                addedCount++;
            }
        });

        setProducts(updatedProductList);
        addAuditLog('IMPORT_PRODUCTS', `Imported products via CSV. Added: ${addedCount}, Updated: ${updatedCount}.`);
        showToast(`Products imported: ${addedCount} new, ${updatedCount} updated.`, 'success');
    };

    // Customer Management
    const addCustomer = (customerData: Omit<Customer, 'id' | 'dateAdded' | 'loyaltyPoints'>) => {
        if (customers.some(c => c.phone === customerData.phone && c.phone !== 'N/A')) {
            showToast('A customer with this phone number already exists.', 'error');
            return;
        }
        const newCustomer: Customer = {
            ...customerData,
            id: `cust_${Date.now()}`,
            dateAdded: new Date(),
            loyaltyPoints: 0,
        };
        setCustomers(prev => [newCustomer, ...prev]);
        addAuditLog('ADD_CUSTOMER', `Added customer: ${newCustomer.name}.`);
        showToast('Customer added successfully!');
    };
    
    const updateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        addAuditLog('UPDATE_CUSTOMER', `Updated customer: ${updatedCustomer.name}.`);
        showToast('Customer updated successfully!');
    };
    
    const deleteCustomer = (customerId: string) => {
        if (customerId === 'cust001') {
            showToast('Cannot delete the default Walk-in Customer.', 'error');
            return;
        }
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        addAuditLog('DELETE_CUSTOMER', `Deleted customer ID: ${customerId}.`);
        showToast('Customer deleted successfully!');
    };

    // Supplier Management
    const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
        if (suppliers.some(s => s.name.toLowerCase() === supplierData.name.toLowerCase())) {
            showToast('A supplier with this name already exists.', 'error');
            return null;
        }
        const newSupplier: Supplier = {
            ...supplierData,
            id: `sup_${Date.now()}`,
        };
        setSuppliers(prev => [newSupplier, ...prev]);
        addAuditLog('ADD_SUPPLIER', `Added supplier: ${newSupplier.name}.`);
        showToast('Supplier added successfully!');
        return newSupplier;
    };

    // Purchase Order Management
    const addPurchaseOrder = useCallback((poData: PurchaseOrderData): PurchaseOrder => {
        const newPO: PurchaseOrder = {
            id: `po_${Date.now()}`,
            poNumber: `PO-${Date.now().toString().slice(-6)}`,
            supplierId: poData.supplierId,
            items: poData.items,
            status: poData.status,
            createdDate: new Date(),
            expectedDate: poData.expectedDate,
            totalCost: poData.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0),
        };
        setPurchaseOrders(prev => [newPO, ...prev]);
        addAuditLog('ADD_PO', `Created PO ${newPO.poNumber} with status ${poData.status}.`);
        showToast(`Purchase Order ${newPO.poNumber} created as ${poData.status}.`, 'success');
        return newPO;
    }, [showToast, setPurchaseOrders, addAuditLog]);

    const receivePurchaseOrder = useCallback((purchaseOrderId: string) => {
        let receivedPO: PurchaseOrder | undefined;

        setPurchaseOrders(prevPOs => {
            const updatedPOs = prevPOs.map(po => {
                if (po.id === purchaseOrderId) {
                    receivedPO = { ...po, status: 'Received', receivedDate: new Date() };
                    return receivedPO;
                }
                return po;
            });
            return updatedPOs;
        });
        
        if (receivedPO) {
            const po = receivedPO;
            setProducts(prevProducts => {
                const updatedProducts = [...prevProducts];
                po.items.forEach(item => {
                    const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                    if (productIndex !== -1) {
                         if (products[productIndex].productType === 'Inventory') {
                            updatedProducts[productIndex].stock += item.quantity;
                        }
                    }
                });
                return updatedProducts;
            });

            const { tax } = settings;
            let subtotal: number;
            let taxAmount: number;
            let totalAmount: number;

            if (tax.pricingType === 'inclusive') {
                totalAmount = po.totalCost;
                const breakdown = getPriceBreakdown(totalAmount, 'inclusive', tax.vatRate / 100);
                subtotal = breakdown.basePrice;
                taxAmount = breakdown.vatAmount;
            } else { // exclusive
                subtotal = po.totalCost;
                taxAmount = subtotal * (tax.vatRate / 100);
                totalAmount = subtotal + taxAmount;
            }
            
            const supplier = suppliers.find(s => s.id === po.supplierId);
            const creditDays = supplier ? parseInt(supplier.creditTerms.replace('Net ', '')) || 0 : 30;
            const invoiceDate = po.receivedDate || new Date();
            const dueDate = new Date(invoiceDate);
            dueDate.setDate(dueDate.getDate() + creditDays);

            const newInvoice: SupplierInvoice = {
                id: `inv_${po.id}`,
                invoiceNumber: `INV-${po.poNumber}`,
                purchaseOrderId: po.id,
                supplierId: po.supplierId,
                invoiceDate: invoiceDate,
                dueDate: dueDate,
                subtotal: round(subtotal),
                taxAmount: round(taxAmount),
                totalAmount: round(totalAmount),
                paidAmount: 0,
                status: 'Unpaid'
            };
            setSupplierInvoices(prev => [newInvoice, ...prev]);
            addAuditLog('RECEIVE_PO', `Received PO ${po.poNumber} and generated Invoice ${newInvoice.invoiceNumber}.`);
            showToast(`Stock for PO ${po.poNumber} received.`, 'success');
        }
    }, [suppliers, products, setPurchaseOrders, setProducts, setSupplierInvoices, settings.tax, addAuditLog, showToast]);
    
    const poToReceiveBreakdown = useMemo(() => {
        if (!poToReceive) return null;

        const { tax } = settings;
        let subtotal: number;
        let taxAmount: number;
        let totalAmount: number;
        
        if (tax.pricingType === 'inclusive') {
            totalAmount = poToReceive.totalCost;
            const breakdown = getPriceBreakdown(totalAmount, 'inclusive', tax.vatRate / 100);
            subtotal = breakdown.basePrice;
            taxAmount = breakdown.vatAmount;
        } else { // exclusive
            subtotal = poToReceive.totalCost;
            taxAmount = subtotal * (tax.vatRate / 100);
            totalAmount = subtotal + taxAmount;
        }
        
        return {
            subtotal: round(subtotal),
            tax: round(taxAmount),
            total: round(totalAmount),
        };

    }, [poToReceive, settings.tax]);

    const handleConfirmAddToPO = (
        product: Product, 
        quantity: number, 
        poId: string | 'new', 
        supplierId?: string
    ) => {
        const poItem: PurchaseOrderItem = {
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            cost: product.costPrice || 0,
        };

        if (poId === 'new') {
            if (!supplierId) {
                showToast('A supplier must be selected to create a new PO.', 'error');
                return;
            }
            addPurchaseOrder({
                supplierId: supplierId,
                items: [poItem],
                status: 'Draft',
                expectedDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 1 week
            });
            showToast(`New PO created for ${product.name}.`, 'success');
        } else {
            setPurchaseOrders(prevPOs => prevPOs.map(po => {
                if (po.id === poId) {
                    const updatedPO = { ...po };
                    const existingItemIndex = updatedPO.items.findIndex(item => item.productId === product.id);
                    if (existingItemIndex > -1) {
                        updatedPO.items[existingItemIndex].quantity += quantity;
                    } else {
                        updatedPO.items.push(poItem);
                    }
                    // Recalculate total cost
                    updatedPO.totalCost = updatedPO.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
                    showToast(`${product.name} added to PO ${po.poNumber}.`, 'success');
                    return updatedPO;
                }
                return po;
            }));
        }
        setProductForPO(null); // Close the modal
    };


    // Accounts Payable
    const recordSupplierPayment = useCallback((invoiceId: string, payment: Omit<SupplierPayment, 'id' | 'invoiceId'>) => {
        setSupplierInvoices(prevInvoices => 
            prevInvoices.map(invoice => {
                if (invoice.id === invoiceId) {
                    const newPaidAmount = invoice.paidAmount + payment.amount;
                    let newStatus: SupplierInvoice['status'] = 'Partially Paid';
                    if (newPaidAmount >= invoice.totalAmount) {
                        newStatus = 'Paid';
                    }
                     addAuditLog('RECORD_SUPPLIER_PAYMENT', `Paid ${payment.amount} for invoice ${invoice.invoiceNumber}.`);
                    return {
                        ...invoice,
                        paidAmount: newPaidAmount,
                        status: newStatus
                    };
                }
                return invoice;
            })
        );
        showToast('Supplier payment recorded successfully.', 'success');
    }, [setSupplierInvoices, addAuditLog, showToast]);

    // Quotations
    const addQuotation = useCallback((quotation: Omit<Quotation, 'id'>) => {
        const newQuotation: Quotation = {
            ...quotation,
            id: `quo_${Date.now()}`,
        };
        setQuotations(prev => [newQuotation, ...prev]);
        addAuditLog('ADD_QUOTATION', `Created quotation ${newQuotation.quoteNumber}.`);
        showToast('Quotation created successfully!');
        setIsCreateQuoteModalOpen(false);
        setSelectedQuotation(newQuotation);
    }, [showToast, setQuotations, addAuditLog]);

    const convertQuoteToSale = useCallback((quote: Quotation) => {
        if (!activeShift) {
            showToast('Please start a shift before converting a quote.', 'error');
            return;
        }
        const quoteCartItems: CartItem[] = quote.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                showToast(`Product "${item.productName}" is no longer available.`, 'error');
                return null;
            }
            if (product.stock < item.quantity && product.productType === 'Inventory') {
                showToast(`Not enough stock for "${item.productName}". Available: ${product.stock}, Quoted: ${item.quantity}`, 'error');
                return null;
            }
            return { ...product, quantity: item.quantity, price: item.price }; // Use quoted price
        }).filter((item): item is CartItem => item !== null);
        
        if (quoteCartItems.length !== quote.items.length) {
            showToast('Could not convert quote due to missing products or insufficient stock.', 'error');
            return;
        }
        
        setCart(quoteCartItems);
        setSelectedCustomerId(quote.customerId);
        setOriginatingQuoteId(quote.id);
        setCurrentView(View.POS);
        setQuotations(prev => prev.map(q => q.id === quote.id ? {...q, status: 'Invoiced'} : q));
        addAuditLog('CONVERT_QUOTE', `Converted quote ${quote.quoteNumber} to sale.`);
        showToast(`Quote #${quote.quoteNumber} loaded into POS.`, 'info');
    }, [products, showToast, activeShift, setQuotations, addAuditLog]);

    // Communication
    const handleEmailRequest = (documentType: 'Receipt' | 'Quotation' | 'Proforma-Invoice', documentId: string, customerId: string) => {
        setEmailInfo({ documentType, documentId, customerId });
    };

    const handleSendEmail = (recipientEmail: string) => {
        if (!emailInfo) return;
        // In a real app, this would trigger a backend API call.
        addAuditLog('EMAIL_SENT', `Sent ${emailInfo.documentType.replace('-',' ')} ${emailInfo.documentId} to ${recipientEmail}.`);
        showToast(`${emailInfo.documentType.replace('-',' ')} sent to ${recipientEmail} successfully!`, 'success');
        setEmailInfo(null);
    };

    const customerForEmail = useMemo(() => {
        if (!emailInfo) return null;
        return customers.find(c => c.id === emailInfo.customerId);
    }, [emailInfo, customers]);

    const handleSendWhatsApp = useCallback((recipients: Customer[], message: string) => {
        if (settings.communication.whatsapp.provider === 'none') {
            showToast('WhatsApp provider is not configured in settings.', 'error');
            return;
        }
        addAuditLog('WHATSAPP_SENT', `Sent ${whatsAppInfo?.mode === 'receipt' ? 'receipt' : 'bulk message'} to ${recipients.length} recipients.`);
        showToast(`WhatsApp message sent to ${recipients.length} recipients successfully!`, 'success');
        setWhatsAppInfo(null);
    }, [whatsAppInfo, addAuditLog, showToast, settings.communication.whatsapp.provider]);

    const customerForWhatsApp = useMemo(() => {
        if (!whatsAppInfo || !whatsAppInfo.customerId) return undefined;
        return customers.find(c => c.id === whatsAppInfo.customerId);
    }, [whatsAppInfo, customers]);

    // Data Management
    const handleBackupData = async () => {
        try {
            await db.initDB();
            const offlineCart = await db.getCart();
            const offlineQueue = await db.getAllQueuedOrders();

            const backupData = {
                products, customers, sales, suppliers, purchaseOrders,
                supplierInvoices, quotations, users, settings, auditLogs,
                shifts, offlineCart, offlineQueue
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(backupData, null, 2)
            )}`;
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = jsonString;
            link.download = `kenpos_backup_${date}.json`;
            link.click();
            addAuditLog('BACKUP_DATA', 'Full system data backup downloaded.');
            showToast('System backup downloaded successfully.', 'success');
        } catch (error) {
            console.error('Backup failed:', error);
            showToast('Failed to create backup file.', 'error');
        }
    };

    const handleRestoreData = async (backupData: any) => {
        try {
            // Basic validation
            if (!backupData || typeof backupData !== 'object' || !backupData.users || !backupData.settings) {
                throw new Error("Invalid or corrupted backup file.");
            }
            
            setProducts(backupData.products || []);
            setCustomers(backupData.customers || MOCK_CUSTOMERS);
            setSales(backupData.sales || []);
            setSuppliers(backupData.suppliers || []);
            setPurchaseOrders(backupData.purchaseOrders || []);
            setSupplierInvoices(backupData.supplierInvoices || []);
            setQuotations(backupData.quotations || []);
            setUsers(backupData.users || MOCK_USERS);
            setSettings(backupData.settings || DEFAULT_SETTINGS);
            setAuditLogs(backupData.auditLogs || []);
            setShifts(backupData.shifts || []);
            
            // Restore IndexedDB data
            await db.restoreCart(backupData.offlineCart || []);
            await db.restoreQueue(backupData.offlineQueue || []);
            await updateQueuedCount();

            addAuditLog('RESTORE_DATA', 'System data restored from backup file.');
            showToast('System data restored successfully! The application will now reload.', 'success');
            
            setTimeout(() => window.location.reload(), 2000);

        } catch (error: any) {
            console.error('Restore failed:', error);
            showToast(`Restore failed: ${error.message}`, 'error');
        }
    };

    const handleFactoryReset = () => {
        try {
            const keysToWipe = [
                'kenpos_products', 'kenpos_customers', 'kenpos_sales', 
                'kenpos_suppliers', 'kenpos_purchaseOrders', 'kenpos_supplierInvoices', 
                'kenpos_quotations', 'kenpos_users', 'kenpos_settings', 
                'kenpos_auditLogs', 'kenpos_shifts'
            ];
            keysToWipe.forEach(key => window.localStorage.removeItem(key));
            
            // Also clear IndexedDB
            window.indexedDB.deleteDatabase('KenPOS-Offline');

            showToast('System has been wiped and will now reload.', 'success');
            
            // Reload to re-initialize the app from a clean state
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Factory reset failed:', error);
            showToast('Factory reset failed. Please clear your browser data manually.', 'error');
        }
    };

    const renderView = () => {
        if (!currentUser) return null; // Should be handled by AuthView
        const userPermissions = settings.permissions[currentUser.role] || [];
        
        switch (currentView) {
            case View.POS:
                return (
                    <PosView
                        products={products}
                        cart={cart}
                        customers={customers}
                        selectedCustomerId={selectedCustomerId}
                        onCustomerChange={setSelectedCustomerId}
                        addToCart={addToCart}
                        updateCartItemQuantity={updateCartItemQuantity}
                        removeFromCart={removeFromCart}
                        completeSale={completeSale}
                        isOnline={isOnline}
                        currentUser={currentUser}
                        settings={settings}
                        sales={sales}
                        activeShift={activeShift}
                        onStartShift={handleStartShift}
                        onEndShiftRequest={() => setIsEndingShift(true)}
                        isEndingShift={isEndingShift}
                        onConfirmEndShift={handleEndShift}
                        onCancelEndShift={() => setIsEndingShift(false)}
                        shiftReportToShow={shiftReportToShow}
                        onCloseShiftReport={() => setShiftReportToShow(null)}
                        onEmailReceiptRequest={(saleId, customerId) => handleEmailRequest('Receipt', saleId, customerId)}
                        onWhatsAppReceiptRequest={(saleId, customerId) => setWhatsAppInfo({ mode: 'receipt', documentId: saleId, customerId })}
                    />
                );
            case View.Dashboard:
                 return <DashboardView sales={sales} products={products} suppliers={suppliers} supplierInvoices={supplierInvoices} />;
            case View.Inventory:
                 return <InventoryView products={products} onUpdateProduct={updateProduct} onDeleteProductRequest={setProductToDelete} permissions={userPermissions} onAddProduct={addProduct} onImportProducts={handleImportProducts} />;
            case View.Purchases:
                return <PurchasesView purchaseOrders={purchaseOrders} suppliers={suppliers} products={products} onReceivePORequest={setPoToReceive} onAddPurchaseOrder={addPurchaseOrder} onAddSupplier={addSupplier} permissions={userPermissions} />;
            case View.AccountsPayable:
                return <AccountsPayableView invoices={supplierInvoices} suppliers={suppliers} onRecordPayment={recordSupplierPayment} />;
            case View.TaxReports:
                 return <TaxReportView sales={sales} supplierInvoices={supplierInvoices} settings={settings} />;
            case View.ShiftReport:
                return <ShiftReportView shifts={shifts} sales={sales} settings={settings} />;
            case View.Customers:
                return <CustomersView customers={customers} sales={sales} onAddCustomer={addCustomer} onUpdateCustomer={updateCustomer} onDeleteCustomer={deleteCustomer} permissions={userPermissions} onBulkMessage={() => setWhatsAppInfo({ mode: 'bulk' })} />;
            case View.Quotations:
                 return selectedQuotation ? (
                    <QuotationDetailView
                        quotation={selectedQuotation}
                        settings={settings}
                        sales={sales}
                        onBack={() => setSelectedQuotation(null)}
                        onConvertQuoteToSale={quote => {
                            convertQuoteToSale(quote);
                            setSelectedQuotation(null);
                        }}
                        onEmailRequest={(type, quoteId, customerId) => handleEmailRequest(type, quoteId, customerId)}
                        permissions={userPermissions}
                    />
                ) : (
                    <QuotationsView
                        quotations={quotations}
                        sales={sales}
                        onSelectQuotation={setSelectedQuotation}
                        onCreateQuoteRequest={() => setIsCreateQuoteModalOpen(true)}
                        permissions={userPermissions}
                    />
                );
            case View.Settings:
                return <SettingsView settings={settings} onUpdateSettings={updateSettings} users={users} onAddUser={addUser} onUpdateUser={updateUser} onDeleteUser={deleteUser} auditLogs={auditLogs} showToast={showToast} onBackup={handleBackupData} onRestore={handleRestoreData} onFactoryReset={handleFactoryReset} />;
            default:
                return <div>Not Found</div>;
        }
    };

    if (!isAuthenticated) {
        return <AuthView onLogin={handleLogin} onSignUp={handleSignUp} isInitialSignUp={users.length === 0} />;
    }

    if (!settings.isSetupComplete && currentUser?.role === 'Admin') {
        return <SetupWizard 
            settings={settings}
            onUpdateSettings={updateSettings}
            showToast={showToast}
            onSetupComplete={() => {
                const updatedSettings = { ...settings, isSetupComplete: true };
                setSettings(updatedSettings);
                showToast('Setup complete! Welcome to KenPOS™.', 'success');
            }}
        />;
    }

    return (
        <div className="flex h-screen bg-slate-200 font-sans">
            {currentUser && (
                <Sidebar 
                    currentView={currentView} 
                    setCurrentView={setCurrentView}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    role={currentUser.role}
                    permissions={settings.permissions[currentUser.role] || []}
                />
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                {currentUser && (
                    <Header 
                        isOnline={isOnline} 
                        queuedSalesCount={queuedOrderCount}
                        onMenuClick={() => setIsSidebarOpen(true)}
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        products={products}
                        currentEvent={currentEvent}
                    />
                )}
                <main className="flex-1 overflow-y-auto bg-slate-100 relative">
                     <AnimatePresence>
                        {toasts.map(toast => (
                            <Toast key={toast.id} {...toast} />
                        ))}
                    </AnimatePresence>
                     <AnimatePresence>
                        {productToDelete && (
                            <ConfirmationModal
                                title="Delete Product?"
                                message={`Are you sure you want to permanently delete "${productToDelete.name}"? This action cannot be undone.`}
                                confirmText="Delete"
                                onConfirm={deleteProduct}
                                onClose={() => setProductToDelete(null)}
                                isDestructive
                            />
                        )}
                         {poToReceive && poToReceiveBreakdown && (
                            <ReceivePOModal
                                purchaseOrder={poToReceive}
                                supplier={suppliers.find(s => s.id === poToReceive.supplierId)}
                                breakdown={poToReceiveBreakdown}
                                onClose={() => setPoToReceive(null)}
                                onConfirm={() => {
                                    receivePurchaseOrder(poToReceive.id);
                                    setPoToReceive(null);
                                }}
                            />
                        )}
                         {productForPO && (
                            <AddToPOModal
                                product={productForPO}
                                suppliers={suppliers}
                                purchaseOrders={purchaseOrders}
                                onConfirm={handleConfirmAddToPO}
                                onClose={() => setProductForPO(null)}
                            />
                        )}
                        {isCreateQuoteModalOpen && (
                            <CreateQuotationForm
                                customers={customers.filter(c => c.id !== 'cust001')}
                                products={products}
                                settings={settings}
                                onSave={addQuotation}
                                onCancel={() => setIsCreateQuoteModalOpen(false)}
                            />
                        )}
                        {emailInfo && customerForEmail && (
                            <EmailModal
                                documentType={emailInfo.documentType}
                                documentId={emailInfo.documentId}
                                customerName={customerForEmail.name}
                                defaultEmail={customerForEmail.email}
                                onSend={handleSendEmail}
                                onClose={() => setEmailInfo(null)}
                            />
                        )}
                        {whatsAppInfo && (
                            <WhatsAppModal
                                mode={whatsAppInfo.mode}
                                customer={customerForWhatsApp}
                                customers={customers}
                                documentId={whatsAppInfo.documentId}
                                onClose={() => setWhatsAppInfo(null)}
                                onSend={handleSendWhatsApp}
                            />
                        )}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                       <AnimatedView key={currentView + (selectedQuotation?.id || '')}>
                         {renderView()}
                       </AnimatedView>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default App;