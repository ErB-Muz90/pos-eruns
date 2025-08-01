import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sale, User, Settings } from '../../types';
import Receipt from './Receipt';
import { ICONS } from '../../constants';

interface SaleSuccessViewProps {
    sale: Sale;
    onNewSale: () => void;
    currentUser: User;
    settings: Settings;
    onEmailReceiptRequest: (saleId: string, customerId: string) => void;
    onWhatsAppReceiptRequest: (saleId: string, customerId: string) => void;
    shouldAutoPrint?: boolean;
    onAutoPrintDone?: () => void;
}

const SaleSuccessView = ({ sale, onNewSale, currentUser, settings, onEmailReceiptRequest, onWhatsAppReceiptRequest, shouldAutoPrint, onAutoPrintDone }: SaleSuccessViewProps) => {

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        if (shouldAutoPrint && settings.hardware.printer.type === 'Browser') {
            const timer = setTimeout(() => {
                handlePrint();
                if (onAutoPrintDone) onAutoPrintDone();
            }, 500); // Small delay for component to render
            return () => clearTimeout(timer);
        }
    }, [shouldAutoPrint, onAutoPrintDone, settings.hardware.printer.type]);


    return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-100 p-4 md:p-8">
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
                <div className="flex-grow bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        className="bg-green-100 rounded-full p-4 mb-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-800">Sale Complete!</h1>
                    <p className="text-slate-500 mt-2">Transaction ID: {sale.id}</p>
                    {!sale.synced && (
                        <div className="mt-4 bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full">
                            This sale was completed offline and is queued for syncing.
                        </div>
                    )}
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <motion.button
                            onClick={onNewSale}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 transition-colors shadow-md text-lg"
                        >
                            New Sale
                        </motion.button>
                        <motion.button
                            onClick={() => onEmailReceiptRequest(sale.id, sale.customerId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Email Receipt
                        </motion.button>
                        <motion.button
                            onClick={() => onWhatsAppReceiptRequest(sale.id, sale.customerId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#25D366] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#1EAE53] transition-colors shadow-md text-lg flex items-center"
                        >
                            <div className="w-5 h-5 mr-2">{ICONS.whatsapp}</div>
                            WhatsApp
                        </motion.button>
                        <motion.button
                            onClick={handlePrint}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors shadow-md text-lg flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                            Print Receipt
                        </motion.button>
                    </div>
                </div>

                <div className="w-full md:w-96 flex-shrink-0">
                    <div id="receipt-container">
                        <Receipt sale={sale} cashierName={currentUser.name} settings={settings} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleSuccessView;
