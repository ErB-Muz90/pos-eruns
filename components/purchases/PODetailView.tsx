
import React from 'react';
import { motion } from 'framer-motion';
import { PurchaseOrder, Supplier } from '../../types';

interface PODetailViewProps {
    purchaseOrder: PurchaseOrder;
    supplier?: Supplier;
    onBack: () => void;
}

const Stat: React.FC<{ label: string; value: string | React.ReactNode; }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800">{value}</p>
    </div>
);

const PODetailView: React.FC<PODetailViewProps> = ({ purchaseOrder, supplier, onBack }) => {
    
    const { poNumber, status, createdDate, expectedDate, receivedDate, totalCost, items } = purchaseOrder;

    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 h-full overflow-y-auto"
        >
            <div className="mb-6">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to All Purchase Orders
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">PO: {poNumber}</h1>
                        <p className="mt-1 text-slate-600">Supplier: <span className="font-semibold">{supplier?.name || 'N/A'}</span></p>
                    </div>
                     <div className="text-right mt-4 md:mt-0">
                        <p className="font-bold text-3xl text-emerald-600">{formatCurrency(totalCost)}</p>
                        <p className="text-sm text-slate-500">Total Cost</p>
                    </div>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-4">
                    <Stat label="Status" value={status} />
                    <Stat label="Created Date" value={new Date(createdDate).toLocaleDateString()} />
                    <Stat label="Expected Date" value={new Date(expectedDate).toLocaleDateString()} />
                    <Stat label="Received Date" value={receivedDate ? new Date(receivedDate).toLocaleDateString() : 'N/A'} />
                 </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">Order Items</h2>
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                            <th scope="col" className="px-6 py-3 text-right">Unit Cost</th>
                            <th scope="col" className="px-6 py-3 text-right">Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.productId} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{item.productName}</td>
                                <td className="px-6 py-4 text-center font-mono">{item.quantity}</td>
                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.cost)}</td>
                                <td className="px-6 py-4 text-right font-mono font-semibold">{formatCurrency(item.cost * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>

        </motion.div>
    );
};

export default PODetailView;
