import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Role } from '../../types';

interface UserModalProps {
    onClose: () => void;
    onSave: (user: Omit<User, 'id'> | User) => void;
    user?: User;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Cashier' as Role,
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const isEditMode = Boolean(user);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '', // Password field is cleared for editing
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!isEditMode && formData.password.length < 6) {
             setError('Password must be at least 6 characters long.');
             return;
        }
        
        if (isEditMode && formData.password && formData.password.length < 6) {
             setError('New password must be at least 6 characters long.');
             return;
        }
        
        const finalData = { ...formData };
        if (isEditMode) {
            const updatedUser = { ...user, ...finalData };
            // If password field is empty in edit mode, keep the old one.
            if (!finalData.password) {
                updatedUser.password = user.password;
            }
            onSave(updatedUser);
        } else {
             onSave(finalData);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
            >
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required autoFocus className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                             <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                                <option>Cashier</option>
                                <option>Supervisor</option>
                                <option>Accountant</option>
                                <option>Admin</option>
                             </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required={!isEditMode} placeholder={isEditMode ? "Leave blank to keep current" : ""} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Confirm Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={!isEditMode || !!formData.password} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"/>
                    </div>
                    {error && (
                        <p className="text-center text-sm text-red-600">{error}</p>
                    )}
                     <div className="mt-8 flex justify-end space-x-3">
                        <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.95 }} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Cancel</motion.button>
                        <motion.button type="submit" whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md">Save User</motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default UserModal;