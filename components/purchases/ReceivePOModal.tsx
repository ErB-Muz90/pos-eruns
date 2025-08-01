import React from 'react';
import { motion } from 'framer-motion';
import { PurchaseOrder, Supplier } from '../../types';

interface ReceivePOModalProps {
    purchaseOrder: PurchaseOrder;
    supplier?: Supplier;
    breakdown: { subtotal: number, tax: number, total: number };
    onConfirm: () => void;
    onClose: () => void;
}

const BreakdownRow: React.FC<{ label: string, value: string, isBold?: boolean }> = ({ label, value, isBold }) => (
    <div className={`flex justify-between py-2 ${isBold ? 'font-bold' : ''}`}>
        <span className="text-slate-600">{label}</span>
        <span className="font-mono text-slate-800">{value}</span>
    </div>
);

const ReceivePOModal: React.FC<ReceivePOModalProps> = ({ purchaseOrder, supplier, breakdown, onConfirm, onClose }) => {
    
    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;
    
    return (
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Confirm PO Reception</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                 <p className="text-slate-500 mb-6">
                    Confirming will receive stock for PO <span className="font-semibold text-slate-700">{purchaseOrder.poNumber}</span> from <span className="font-semibold text-slate-700">{supplier?.name}</span> and generate a payable invoice.
                </p>

                <div className="bg-slate-50 p-4 rounded-lg space-y-1 text-sm">
                    <h3 className="font-bold text-slate-700 mb-2">Payable Invoice Breakdown</h3>
                    <BreakdownRow label="Subtotal" value={formatCurrency(breakdown.subtotal)} />
                    <BreakdownRow label="VAT" value={formatCurrency(breakdown.tax)} />
                    <div className="border-t border-slate-200 !my-2"></div>
                    <BreakdownRow label="Total Payable" value={formatCurrency(breakdown.total)} isBold />
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                    <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                    <motion.button
                        onClick={onConfirm}
                        whileTap={{ scale: 0.98 }}
                        className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg text-lg hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                        Confirm & Receive
                    </motion.button>
                </div>

            </motion.div>
        </motion.div>
    );
};

export default ReceivePOModal;
