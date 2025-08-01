import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ToastData } from '../../types';

interface HardwareSettingsProps {
    settings: Settings;
    onUpdateSettings: (settings: Partial<Settings>) => void;
    showToast: (message: string, type: ToastData['type']) => void;
}

const InputField: React.FC<{ label: string, name: string, value: string | number | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, parent: string }> = ({ label, name, value, onChange, type = 'text', placeholder = '', parent }) => (
    <div>
        <label htmlFor={`${parent}-${name}`} className="block text-sm font-medium text-slate-700">{label}</label>
        <input
            type={type}
            name={name}
            id={`${parent}-${name}`}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
    </div>
);

const RadioGroup: React.FC<{ label: string, name: string, value: string, options: { value: string, label: string }[], onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, options, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-2 flex space-x-4">
            {options.map(option => (
                <label key={option.value} className="flex items-center">
                    <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-slate-300" />
                    <span className="ml-2 text-sm text-slate-700">{option.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const Toggle: React.FC<{ label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, checked, onChange }) => (
     <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <label htmlFor={name} className="inline-flex relative items-center cursor-pointer">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} id={name} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
    </div>
);

const HardwareSettings: React.FC<HardwareSettingsProps> = ({ settings, onUpdateSettings, showToast }) => {
    const [formData, setFormData] = useState(settings.hardware);

    const handlePrinterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            printer: { ...prev.printer, [name]: value }
        }));
    };
    
    const handleScannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            barcodeScanner: { ...prev.barcodeScanner, [name]: checked }
        }));
    };

    const handleBarcodePrinterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

         setFormData(prev => ({
            ...prev,
            barcodePrinter: { 
                ...prev.barcodePrinter, 
                [name]: isCheckbox ? checked : value
            }
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({ hardware: formData });
    };

    const handleTest = (device: string) => {
        showToast(`This would send a test command to the ${device}. (Not implemented in this demo)`, 'info');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Receipt Printer */}
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Receipt Printer</h3>
                     <motion.button type="button" onClick={() => handleTest('Receipt Printer')} whileTap={{ scale: 0.95 }} className="bg-white text-emerald-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-200">
                        Test Print
                    </motion.button>
                </div>
                <div className="mt-4 space-y-4">
                    <RadioGroup label="Printer Type" name="type" value={formData.printer.type} onChange={handlePrinterChange} options={[
                        { value: 'Browser', label: 'Browser Print' },
                        { value: 'ESC/POS', label: 'ESC/POS Direct' }
                    ]} />
                    <p className="text-xs text-slate-500">
                        Browser Print uses the standard browser print dialog. ESC/POS attempts to communicate directly with compatible receipt printers.
                    </p>
                    <AnimatePresence>
                        {formData.printer.type === 'ESC/POS' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pl-4 border-l-2 border-emerald-200 overflow-hidden">
                                <RadioGroup label="Connection" name="connection" value={formData.printer.connection} onChange={handlePrinterChange} options={[
                                    { value: 'USB', label: 'USB' },
                                    { value: 'Bluetooth', label: 'Bluetooth' },
                                    { value: 'Network', label: 'Network' }
                                ]} />
                                 <p className="text-xs text-slate-500">
                                   Direct USB/Bluetooth printing requires WebUSB/WebBluetooth support and user permission.
                                </p>
                                {formData.printer.connection === 'Network' && (
                                     <InputField label="IP Address" parent="printer" name="address" value={formData.printer.address} onChange={handlePrinterChange} placeholder="e.g., 192.168.1.100" />
                                )}
                                <InputField label="Printer Name (Optional)" parent="printer" name="name" value={formData.printer.name} onChange={handlePrinterChange} placeholder="e.g., TM-T20II" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Barcode Scanner */}
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Barcode Scanner</h3>
                <div className="mt-4 space-y-2">
                    <Toggle label="Enable Barcode Scanning" name="enabled" checked={formData.barcodeScanner.enabled} onChange={handleScannerChange} />
                     <p className="text-xs text-slate-500">
                        Most USB scanners work by emulating a keyboard and should function automatically on the POS screen. This setting confirms the feature is active.
                    </p>
                </div>
            </div>

            {/* Barcode Label Printer */}
             <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Barcode Label Printer</h3>
                     <motion.button type="button" onClick={() => handleTest('Label Printer')} disabled={!formData.barcodePrinter.enabled} whileTap={{ scale: 0.95 }} className="bg-white text-emerald-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        Test Label
                    </motion.button>
                </div>
                <div className="mt-4 space-y-4">
                    <Toggle label="Enable Label Printing" name="enabled" checked={formData.barcodePrinter.enabled} onChange={handleBarcodePrinterChange} />
                    <AnimatePresence>
                        {formData.barcodePrinter.enabled && (
                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pl-4 border-l-2 border-emerald-200 overflow-hidden">
                                <p className="text-xs text-slate-500">
                                    Configure a dedicated printer for printing product barcode labels from the inventory section.
                                </p>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
                 <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                    Save Hardware Settings
                </motion.button>
            </div>
        </form>
    );
};

export default HardwareSettings;
