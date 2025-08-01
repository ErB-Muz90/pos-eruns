import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '../../types';
import { ICONS } from '../../constants';

interface WhatsAppModalProps {
    mode: 'receipt' | 'bulk';
    customer?: Customer;
    customers?: Customer[];
    documentId?: string;
    onClose: () => void;
    onSend: (recipients: Customer[], message: string) => void;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ mode, customer, customers = [], documentId, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState(customer?.phone || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (mode === 'receipt' && documentId && customer) {
            const customerName = customer.name === 'Walk-in Customer' ? 'Customer' : customer.name;
            setMessage(`Dear ${customerName},\n\nThank you for your business. Here is your receipt ID: ${documentId}.\n\nWe appreciate your patronage.`);
        }
    }, [mode, documentId, customer]);
    
    const validBulkRecipients = useMemo(() => {
        return customers.filter(c => c.id !== 'cust001' && c.phone && c.phone !== 'N/A' && /^(0[17]|254[17])\d{8}$/.test(c.phone));
    }, [customers]);

    const handleSend = () => {
        setError('');
        if (mode === 'receipt' && customer) {
            if (!/^(0[17]|254[17])\d{8}$/.test(phone)) {
                setError('Please enter a valid Kenyan phone number (e.g., 0712345678).');
                return;
            }
            const recipient: Customer = { ...customer, phone };
            onSend([recipient], message);
        } else if (mode === 'bulk') {
             if (!message.trim()) {
                setError('Message cannot be empty.');
                return;
            }
            if(validBulkRecipients.length === 0) {
                 setError('No customers with valid phone numbers to send to.');
                return;
            }
            onSend(validBulkRecipients, message);
        }
    };
    
    const title = mode === 'receipt' ? 'Send WhatsApp Receipt' : 'Send Bulk WhatsApp';
    
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
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                 <div className="space-y-4">
                    {mode === 'receipt' ? (
                        <>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-600">Sending to: <span className="font-bold text-slate-800">{customer?.name}</span></p>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Recipient Phone Number</label>
                                <input type="tel" name="phone" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required autoFocus className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg" />
                            </div>
                        </>
                    ) : (
                         <div className="bg-slate-50 p-4 rounded-lg text-center">
                            <p className="font-semibold text-slate-800">This message will be sent to <span className="text-emerald-600">{validBulkRecipients.length}</span> customers.</p>
                             <p className="text-xs text-slate-500">Only customers with valid phone numbers (excluding Walk-in) will be targeted.</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={mode === 'receipt' ? 4 : 6}
                            placeholder={mode === 'bulk' ? 'Type your promotional message here...' : ''}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                    </div>
                     {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                    <motion.button
                        onClick={handleSend}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#25D366] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1EAE53] transition-colors shadow-md flex items-center"
                    >
                        <div className="w-5 h-5 mr-2">{ICONS.whatsapp}</div>
                        Send Message
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WhatsAppModal;
