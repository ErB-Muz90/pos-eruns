import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';

interface LowStockNotificationPopoverProps {
    lowStockProducts: Product[];
    onClose: () => void;
}

const LowStockNotificationPopover: React.FC<LowStockNotificationPopoverProps> = ({
    lowStockProducts,
    onClose
}) => {
    return (
        <>
            {/* Backdrop to close on clicking outside */}
            <div className="fixed inset-0 z-10" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-1 z-20 border border-slate-200"
            >
                <div className="px-4 py-3 border-b border-slate-200">
                    <h4 className="font-bold text-slate-800">Out of Stock Alerts</h4>
                    <p className="text-sm text-slate-500">The following items are out of stock.</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {lowStockProducts.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {lowStockProducts.map(product => (
                                <li key={product.id} className="p-3 hover:bg-slate-50">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-700">{product.name}</p>
                                        <p className="text-xs text-red-500 font-bold">OUT OF STOCK</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                            No out of stock alerts. Good job!
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default LowStockNotificationPopover;
