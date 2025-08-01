import React, { useState, useMemo, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PurchaseOrder, Supplier, Product, PurchaseOrderData, Permission } from '../types';
import CreatePOForm from './purchases/CreatePOForm';
import PODetailView from './purchases/PODetailView';

interface PurchasesViewProps {
    purchaseOrders: PurchaseOrder[];
    suppliers: Supplier[];
    products: Product[];
    permissions: Permission[];
    onReceivePORequest: (purchaseOrder: PurchaseOrder) => void;
    onAddPurchaseOrder: (poData: PurchaseOrderData) => PurchaseOrder;
    onAddSupplier: (supplierData: Omit<Supplier, 'id'>) => Supplier | null;
}

type ViewMode = 'list' | 'create';

const StatusBadge = ({ status }: { status: PurchaseOrder['status'] }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case 'Received':
            return <span className={`${baseClasses} text-green-800 bg-green-100`}>Received</span>;
        case 'Sent':
            return <span className={`${baseClasses} text-blue-800 bg-blue-100`}>Sent</span>;
        case 'Draft':
            return <span className={`${baseClasses} text-yellow-800 bg-yellow-100`}>Draft</span>;
        case 'Cancelled':
            return <span className={`${baseClasses} text-red-800 bg-red-100`}>Cancelled</span>;
        default:
            return <span className={`${baseClasses} text-slate-800 bg-slate-100`}>Unknown</span>;
    }
};

const PurchasesView = ({ purchaseOrders, suppliers, products, onReceivePORequest, onAddPurchaseOrder, onAddSupplier, permissions }: PurchasesViewProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    const supplierMap = useMemo(() => {
        return suppliers.reduce((acc, supplier) => {
            acc[supplier.id] = supplier.name;
            return acc;
        }, {} as Record<string, string>);
    }, [suppliers]);
    
    const canManage = permissions.includes('manage_purchases');
    
    const handleSavePO = (poData: PurchaseOrderData) => {
        const newPO = onAddPurchaseOrder(poData);
        setViewMode('list');
        setSelectedPO(newPO);
    };

    if (viewMode === 'create') {
        return (
            <CreatePOForm 
                suppliers={suppliers}
                products={products}
                onSave={handleSavePO}
                onCancel={() => setViewMode('list')}
                onAddSupplier={onAddSupplier}
            />
        );
    }
    
    if (selectedPO) {
        return (
            <PODetailView
                purchaseOrder={selectedPO}
                supplier={suppliers.find(s => s.id === selectedPO.supplierId)}
                onBack={() => setSelectedPO(null)}
            />
        );
    }


    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Purchases</h1>
                 {canManage && (
                    <motion.button 
                        onClick={() => setViewMode('create')}
                        whileTap={{ scale: 0.95 }}
                        className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Purchase Order
                    </motion.button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">PO Number</th>
                            <th scope="col" className="px-6 py-3">Supplier</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Expected Date</th>
                            <th scope="col" className="px-6 py-3">Total Cost (Ksh)</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.map(po => (
                            <tr key={po.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedPO(po)}>
                                <td className="px-6 py-4 font-bold text-slate-900">{po.poNumber}</td>
                                <td className="px-6 py-4">{supplierMap[po.supplierId] || 'Unknown'}</td>
                                <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                                <td className="px-6 py-4">{new Date(po.expectedDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-mono">{po.totalCost.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    {canManage && po.status === 'Sent' ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onReceivePORequest(po); }}
                                            className="font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md"
                                        >
                                            Receive Stock
                                        </button>
                                    ) : (
                                         <span className="font-medium text-slate-500">
                                           View Details
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchasesView;