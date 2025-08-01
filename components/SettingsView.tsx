import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, User, AuditLog, ToastData } from '../types';
import BusinessInfoSettings from './settings/BusinessInfoSettings';
import TaxSettings from './settings/TaxSettings';
import UsersPermissionsSettings from './settings/UsersPermissionsSettings';
import EmailSettings from './settings/EmailSettings';
import ReceiptSettings from './settings/ReceiptSettings';
import DataBackupSettings from './settings/DataBackupSettings';
import AuditLogSettings from './settings/AuditLogSettings';
import FactoryResetSettings from './settings/FactoryResetSettings';
import LoyaltySettings from './settings/LoyaltySettings';
import DiscountSettings from './settings/DiscountSettings';
import HardwareSettings from './settings/HardwareSettings';
import SmsSettings from './settings/SmsSettings';
import WhatsAppSettings from './settings/WhatsAppSettings';
import MpesaSettings from './settings/MpesaSettings';
import { ICONS } from '../../constants';

interface SettingsViewProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    users: User[];
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    auditLogs: AuditLog[];
    showToast: (message: string, type: ToastData['type']) => void;
    onBackup: () => void;
    onRestore: (data: any) => void;
    onFactoryReset: () => void;
}

const SettingsModal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-6 overflow-y-auto">
                {children}
            </div>
        </motion.div>
    </motion.div>
);

const SettingsCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <motion.div
        onClick={onClick}
        className="bg-white p-6 rounded-xl shadow-md cursor-pointer flex flex-col justify-between h-full"
        whileHover={{ y: -5, scale: 1.03, boxShadow: "0px 10px 20px -3px rgba(0,0,0,0.07)" }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
        <div>
            <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-grow">{description}</p>
        </div>
        <div className="text-right mt-4 text-sm font-semibold text-emerald-600">
            Manage &rarr;
        </div>
    </motion.div>
);

const SettingsView: React.FC<SettingsViewProps> = (props) => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const settingsConfig = {
        'business-info': {
            title: 'Business Information',
            description: 'Set your company name, KRA PIN, logo, and location.',
            icon: ICONS.business,
            component: <BusinessInfoSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={props.showToast} />,
        },
        'hardware-settings': {
            title: 'Hardware & Peripherals',
            description: 'Configure receipt printers, barcode scanners, and other hardware.',
            icon: ICONS.hardware,
            component: <HardwareSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={props.showToast} />,
        },
        'receipt-settings': {
            title: 'Receipt & Invoice',
            description: 'Customize receipt footers and document numbering.',
            icon: ICONS.receipt,
            component: <ReceiptSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} />,
        },
        'tax-config': {
            title: 'VAT & Tax',
            description: 'Configure VAT rates and default product pricing.',
            icon: ICONS.tax,
            component: <TaxSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} />,
        },
        'discount-settings': {
            title: 'Discounts',
            description: 'Enable and set limits for POS transaction discounts.',
            icon: ICONS.discount,
            component: <DiscountSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} />,
        },
        'loyalty-settings': {
            title: 'Loyalty Program',
            description: 'Manage how customers earn and redeem loyalty points.',
            icon: ICONS.loyalty,
            component: <LoyaltySettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} />,
        },
        'users-perms': {
            title: 'Users & Permissions',
            description: 'Add or remove staff, and manage their access roles.',
            icon: ICONS.users,
            component: <UsersPermissionsSettings {...props} />,
        },
        'email-settings': {
            title: 'Email (SMTP)',
            description: 'Configure settings for sending emails from the system.',
            icon: ICONS.email,
            component: <EmailSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={props.showToast} />,
        },
         'sms-settings': {
            title: 'SMS Gateway',
            description: "Configure services like Africa's Talking to send SMS.",
            icon: ICONS.sms,
            component: <SmsSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={props.showToast} />,
        },
        'whatsapp-settings': {
            title: 'WhatsApp Gateway',
            description: "Configure a WhatsApp Business API provider to send messages.",
            icon: ICONS.whatsapp,
            component: <WhatsAppSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={props.showToast} />,
        },
        'mpesa-settings': {
            title: 'M-Pesa Integration',
            description: "Configure Safaricom M-Pesa Daraja API for STK push payments.",
            icon: ICONS.mpesa,
            component: <MpesaSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={props.showToast} />,
        },
        'audit-logs': {
            title: 'Audit Logs',
            description: 'View a log of all important actions taken in the system.',
            icon: ICONS.audit,
            component: <AuditLogSettings auditLogs={props.auditLogs} users={props.users} />,
        },
        'data-backup': {
            title: 'Data & Backup',
            description: 'Download a backup of all data or restore from a file.',
            icon: ICONS.data,
            component: <DataBackupSettings showToast={props.showToast} onBackup={props.onBackup} onRestore={props.onRestore} />,
        },
        'factory-reset': {
            title: 'Factory Reset',
            description: 'Wipe all data and reset the system to its default state.',
            icon: ICONS.reset,
            component: <FactoryResetSettings showToast={props.showToast} onFactoryReset={props.onFactoryReset} />,
        },
    };

    const categories = [
        {
            title: "Store Setup",
            items: ['business-info', 'hardware-settings', 'receipt-settings', 'email-settings', 'sms-settings', 'whatsapp-settings', 'mpesa-settings']
        },
        {
            title: "Financials & Sales",
            items: ['tax-config', 'discount-settings', 'loyalty-settings']
        },
        {
            title: "System & Security",
            items: ['users-perms', 'audit-logs']
        },
        {
            title: "Data Management",
            items: ['data-backup', 'factory-reset']
        }
    ];

    const activeSettingData = activeModal ? settingsConfig[activeModal] : null;

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
                <p className="mt-1 text-slate-500">Manage your system configurations and security settings.</p>
            </div>
            
            <div className="space-y-8">
                {categories.map(category => (
                    <div key={category.title}>
                        <h2 className="text-xl font-bold text-slate-700 mb-4 pb-2 border-b border-slate-200">{category.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.items.map(itemId => {
                                const item = settingsConfig[itemId];
                                if (!item) return null;
                                return (
                                    <SettingsCard
                                        key={itemId}
                                        title={item.title}
                                        description={item.description}
                                        icon={item.icon}
                                        onClick={() => setActiveModal(itemId)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {activeModal && activeSettingData && (
                    <SettingsModal title={activeSettingData.title} onClose={() => setActiveModal(null)}>
                        {activeSettingData.component}
                    </SettingsModal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SettingsView;