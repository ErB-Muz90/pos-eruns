import React from 'react';
import { motion } from 'framer-motion';
import { Shift, Sale, Settings } from '../../types';
import { getPriceBreakdown } from '../../utils/vatCalculator';

interface ZReportViewProps {
    shift: Shift;
    sales: Sale[];
    onClose: () => void;
    settings: Settings;
    isHistoricalView?: boolean;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
    <div className={`bg-slate-100 p-4 rounded-lg ${className}`}>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
);

const ZReportView: React.FC<ZReportViewProps> = ({ shift, sales: allSales, onClose, settings, isHistoricalView = false }) => {
    
    const shiftSales = allSales.filter(s => shift.salesIds.includes(s.id));

    const totalProfit = shiftSales.reduce((total, sale) => {
        const saleProfit = sale.items.reduce((itemTotal, item) => {
            const { basePrice } = getPriceBreakdown(item.price, item.pricingType, settings.tax.vatRate / 100);
            const itemRevenue = basePrice * item.quantity;
            const itemCost = (item.costPrice || 0) * item.quantity;
            return itemTotal + (itemRevenue - itemCost);
        }, 0);
        const profitAfterDiscount = saleProfit - sale.discountAmount;
        return total + profitAfterDiscount;
    }, 0);

    const handlePrint = () => {
        window.print();
    };
    
    const formatCurrency = (amount: number) => `Ksh ${amount.toFixed(2)}`;
    const variance = shift.cashVariance || 0;
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100 z-40 p-4 md:p-8 overflow-y-auto"
        >
            <div className="max-w-4xl mx-auto">
                <div id="shift-report-container" className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-6">
                    <div className="text-center border-b pb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Z-Report (Shift Summary)</h2>
                        <p className="text-slate-500">
                            For: <span className="font-semibold">{shift.userName}</span> | 
                            Shift ID: <span className="font-mono text-xs">{shift.id}</span>
                        </p>
                        <p className="text-sm text-slate-500">
                            {new Date(shift.startTime).toLocaleString()} - {shift.endTime ? new Date(shift.endTime).toLocaleString() : 'Active'}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Total Sales" value={formatCurrency(shift.totalSales || 0)} />
                        <StatCard title="Total Profit" value={formatCurrency(totalProfit)} />
                        <StatCard title="Transactions" value={String(shift.salesIds.length)} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Shift Reconciliation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1 bg-slate-50 p-4 rounded-lg text-sm">
                                <p className="font-bold text-slate-700 mb-2">Total Collections by Type</p>
                                {Object.entries(shift.paymentBreakdown || {}).map(([method, amount]) => (
                                    <div key={method} className="flex justify-between">
                                        <span>{method}</span>
                                        <span className="font-mono font-semibold">{formatCurrency(amount || 0)}</span>
                                    </div>
                                ))}
                                {!shift.paymentBreakdown || Object.keys(shift.paymentBreakdown).length === 0 && <p className="text-slate-500">No payments recorded.</p>}
                            </div>
                            <div className="space-y-1 bg-slate-50 p-4 rounded-lg text-sm">
                                <p className="font-bold text-slate-700 mb-2">Cash Drawer Reconciliation</p>
                                <div className="flex justify-between"><span>Starting Float</span><span className="font-mono">{formatCurrency(shift.startingFloat)}</span></div>
                                <div className="flex justify-between"><span>+ Cash Sales</span><span className="font-mono">{formatCurrency(shift.paymentBreakdown?.Cash || 0)}</span></div>
                                <div className="flex justify-between text-red-600"><span>- Change Given</span><span className="font-mono">{formatCurrency((shift.paymentBreakdown?.Cash || 0) - (shift.expectedCashInDrawer || 0) + shift.startingFloat)}</span></div>
                                <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Expected in Drawer</span><span className="font-mono">{formatCurrency(shift.expectedCashInDrawer || 0)}</span></div>
                                <div className="flex justify-between"><span>Actual in Drawer</span><span className="font-mono">{formatCurrency(shift.actualCashInDrawer || 0)}</span></div>
                                 <div className={`flex justify-between font-bold text-lg border-t pt-1 mt-1 ${variance === 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    <span>Variance</span>
                                    <span className="font-mono">{formatCurrency(variance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                         <h3 className="text-lg font-semibold text-slate-800 mb-2">Items Sold</h3>
                         <div className="overflow-x-auto rounded-lg border max-h-60">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">Product</th>
                                        <th scope="col" className="px-4 py-2 text-center">Qty</th>
                                        <th scope="col" className="px-4 py-2 text-right">Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shiftSales.flatMap(s => s.items).reduce((acc, item) => {
                                        const existing = acc.find(i => i.id === item.id);
                                        if (existing) {
                                            existing.quantity += item.quantity;
                                        } else {
                                            acc.push({ ...item });
                                        }
                                        return acc;
                                    }, [] as typeof shiftSales[0]['items']).map(p => (
                                        <tr key={p.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-4 py-2 font-medium text-slate-900">{p.name}</td>
                                            <td className="px-4 py-2 text-center font-mono">{p.quantity}</td>
                                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(p.price * p.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-6 no-print">
                    <motion.button onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                        Close
                    </motion.button>
                     <div className="flex space-x-3">
                        <motion.button onClick={handlePrint} whileTap={{ scale: 0.95 }} className="bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                             Print Report
                        </motion.button>
                        <motion.button onClick={handlePrint} whileTap={{ scale: 0.95 }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Download PDF
                        </motion.button>
                     </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ZReportView;