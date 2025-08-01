import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, Role, Permission } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    role: Role;
    permissions: Permission[];
}

interface NavButtonProps {
    view: View;
    label: string;
    currentView: View;
    onClick: (view: View) => void;
    children: ReactNode;
}

const NavButton = ({ view, label, currentView, onClick, children }: NavButtonProps) => {
    const isActive = currentView === view;
    return (
        <motion.button
            onClick={() => onClick(view)}
            className={`flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
            }`}
            aria-label={label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
            <span className="text-xs mt-1 font-medium">{label}</span>
        </motion.button>
    );
};

const NAV_ITEMS: { view: View; label: string; icon: ReactNode; permission: Permission }[] = [
    { view: View.POS, label: 'POS', icon: ICONS.pos, permission: 'view_pos' },
    { view: View.Dashboard, label: 'Dashboard', icon: ICONS.dashboard, permission: 'view_dashboard' },
    { view: View.Inventory, label: 'Inventory', icon: ICONS.inventory, permission: 'view_inventory' },
    { view: View.Purchases, label: 'Purchases', icon: ICONS.purchases, permission: 'view_purchases' },
    { view: View.Quotations, label: 'Quotes', icon: ICONS.quotations, permission: 'view_quotations' },
    { view: View.AccountsPayable, label: 'A/P', icon: ICONS.ap, permission: 'view_ap' },
    { view: View.TaxReports, label: 'Tax', icon: ICONS.tax, permission: 'view_tax_reports' },
    { view: View.ShiftReport, label: 'Shift Report', icon: ICONS.shiftReport, permission: 'view_shift_report' },
    { view: View.Customers, label: 'Customers', icon: ICONS.customers, permission: 'view_customers' },
];

const SidebarContent = ({ currentView, setCurrentView, role, permissions }: Omit<SidebarProps, 'isOpen' | 'setIsOpen'>) => {
    
    return (
        <div className="w-24 bg-white flex flex-col items-center p-2 shadow-lg z-20 border-r border-slate-200 h-full">
            <div className="flex items-center justify-center h-16 w-full flex-shrink-0">
                <div className="bg-emerald-600 text-white text-xl font-bold rounded-lg w-12 h-12 flex items-center justify-center">
                    K
                </div>
            </div>
            <nav className="flex flex-col items-center space-y-3 mt-4 w-full flex-grow overflow-y-auto pb-2">
                 {NAV_ITEMS.filter(item => permissions.includes(item.permission)).map(item => (
                    <NavButton key={item.view} view={item.view} label={item.label} currentView={currentView} onClick={setCurrentView}>
                        {item.icon}
                    </NavButton>
                ))}
            </nav>
            <div className="mt-auto w-full flex-shrink-0">
                {permissions.includes('view_settings') && (
                    <NavButton view={View.Settings} label="Settings" currentView={currentView} onClick={setCurrentView}>
                        {ICONS.settings}
                    </NavButton>
                )}
            </div>
        </div>
    );
};


const Sidebar = ({ currentView, setCurrentView, isOpen, setIsOpen, role, permissions }: SidebarProps) => {
    
    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block flex-shrink-0">
                 <SidebarContent currentView={currentView} setCurrentView={setCurrentView} role={role} permissions={permissions} />
            </div>
            
            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <div className="md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-30"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                             initial={{ x: '-100%' }}
                             animate={{ x: 0 }}
                             exit={{ x: '-100%' }}
                             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                             className="fixed top-0 left-0 h-full z-40"
                        >
                            <SidebarContent currentView={currentView} setCurrentView={(v) => { setCurrentView(v); setIsOpen(false); }} role={role} permissions={permissions} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;