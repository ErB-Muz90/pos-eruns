import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Product } from '../types';
import { ICONS } from '../constants';
import LowStockNotificationPopover from './notifications/LowStockNotificationPopover';

interface HeaderProps {
    isOnline: boolean;
    queuedSalesCount: number;
    onMenuClick: () => void;
    currentUser: User;
    onLogout: () => void;
    products: Product[];
    currentEvent: string | null;
}

const Header = ({ isOnline, queuedSalesCount, onMenuClick, currentUser, onLogout, products, currentEvent }: HeaderProps) => {
    const [time, setTime] = useState(new Date());
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.productType === 'Inventory' && p.stock === 0);
    }, [products]);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsUserMenuOpen(false);
        onLogout();
    }

    return (
        <header className="bg-white h-16 flex items-center justify-between px-4 md:px-6 shadow-sm border-b border-slate-200 flex-shrink-0 relative z-10">
            <div className="flex items-center space-x-4">
                <button onClick={onMenuClick} className="md:hidden text-slate-600 hover:text-emerald-600">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                 <div>
                    <h1 className="text-xl font-bold text-slate-800 hidden sm:block">KenPOS™</h1>
                     {currentEvent && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold text-emerald-600 -mt-1"
                        >
                            {currentEvent} Edition
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center space-x-2">
                    <motion.div 
                      animate={{ scale: isOnline ? 1 : [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span className="text-sm font-semibold text-slate-600 hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                    {!isOnline && queuedSalesCount > 0 && (
                        <span className="text-xs bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full">{queuedSalesCount}</span>
                    )}
                </div>

                <div className="relative">
                    <motion.button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        whileTap={{ scale: 0.95 }}
                        className="text-slate-500 hover:text-emerald-600 p-2 rounded-full hover:bg-slate-100"
                        aria-label="Notifications"
                    >
                        {ICONS.bell}
                        {lowStockProducts.length > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                {lowStockProducts.length}
                            </motion.span>
                        )}
                    </motion.button>
                     <AnimatePresence>
                        {isNotificationsOpen && (
                           <LowStockNotificationPopover
                                lowStockProducts={lowStockProducts}
                                onClose={() => setIsNotificationsOpen(false)}
                           />
                        )}
                    </AnimatePresence>
                </div>

                <div className="text-right hidden md:block border-l pl-6 border-slate-200">
                    <div className="font-semibold text-slate-700">{time.toLocaleTimeString('en-GB')}</div>
                    <div className="text-xs text-slate-500">{time.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</div>
                </div>
                 <div className="relative">
                     <motion.button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 p-1 pr-3 rounded-full transition-colors"
                     >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="text-left">
                           <div className="font-semibold text-sm text-slate-800">{currentUser.name}</div>
                           <div className="text-xs text-slate-500">{currentUser.role}</div>
                        </div>
                         <motion.div animate={{ rotate: isUserMenuOpen ? 180 : 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                         </motion.div>
                     </motion.button>
                      <AnimatePresence>
                        {isUserMenuOpen && (
                           <motion.div
                             initial={{ opacity: 0, y: -10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: -10, scale: 0.95 }}
                             className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-slate-200"
                           >
                            
                             <a href="#" onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                 {ICONS.logout}
                                 <span className="ml-2">Logout</span>
                            </a>
                           </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
            </div>
        </header>
    );
};

export default Header;