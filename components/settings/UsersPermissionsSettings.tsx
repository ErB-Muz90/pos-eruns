import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Role, Settings, Permission } from '../../types';
import { PERMISSIONS_CONFIG } from '../../constants';
import UserModal from './UserModal';
import ConfirmationModal from '../common/ConfirmationModal';

interface UsersPermissionsSettingsProps {
    users: User[];
    settings: Settings;
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateSettings: (settings: Partial<Settings>) => void;
}

type Tab = 'Users' | 'Permissions';

const UsersPermissionsSettings: React.FC<UsersPermissionsSettingsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('Users');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const handlePermissionChange = (role: Role, permission: Permission, checked: boolean) => {
        const currentPermissions = props.settings.permissions[role];
        const newPermissions = checked
            ? [...currentPermissions, permission]
            : currentPermissions.filter(p => p !== permission);
        
        props.onUpdateSettings({
            permissions: {
                ...props.settings.permissions,
                [role]: newPermissions
            }
        });
    };
    
    const openUserModal = (user?: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };
    
    const handleSaveUser = (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            props.onUpdateUser(userData);
        } else {
            props.onAddUser(userData);
        }
        setIsUserModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if(deletingUser) {
            props.onDeleteUser(deletingUser.id);
            setDeletingUser(null);
        }
    };

    const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md relative transition-colors ${
                activeTab === tab 
                ? 'text-emerald-600' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
        >
            {label}
            {activeTab === tab && (
                <motion.div layoutId="users-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
        </button>
    );

    const renderUsers = () => (
        <div className="mt-6">
            <div className="flex justify-end mb-4">
                 <motion.button onClick={() => openUserModal()} whileTap={{ scale: 0.95 }} className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm">
                    Add New User
                </motion.button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.users.map(user => (
                            <tr key={user.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4"><span className="font-semibold">{user.role}</span></td>
                                <td className="px-6 py-4 text-right space-x-4">
                                    <button onClick={() => openUserModal(user)} className="font-medium text-emerald-600 hover:underline">Edit</button>
                                    <button onClick={() => setDeletingUser(user)} className="font-medium text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPermissions = () => (
         <div className="mt-6 overflow-x-auto">
            <div className="rounded-lg shadow-sm border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Permission</th>
                            {(Object.keys(props.settings.permissions) as Role[]).map(role => (
                                <th key={role} scope="col" className="px-6 py-3 text-center">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERMISSIONS_CONFIG.map(({ module, permissions }) => (
                            <React.Fragment key={module}>
                                <tr className="bg-slate-100">
                                    <td colSpan={1 + Object.keys(props.settings.permissions).length} className="px-6 py-2 font-bold text-slate-600">{module}</td>
                                </tr>
                                {permissions.map(p => (
                                    <tr key={p.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-600">{p.label}</td>
                                        {(Object.keys(props.settings.permissions) as Role[]).map(role => (
                                            <td key={`${p.id}-${role}`} className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    checked={props.settings.permissions[role].includes(p.id)}
                                                    onChange={(e) => handlePermissionChange(role, p.id, e.target.checked)}
                                                    disabled={role === 'Admin'} // Admins have all permissions
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div>
            <AnimatePresence>
                {isUserModalOpen && (
                    <UserModal 
                        onClose={() => setIsUserModalOpen(false)}
                        onSave={handleSaveUser}
                        user={editingUser}
                    />
                )}
                {deletingUser && (
                     <ConfirmationModal
                        title={`Delete User ${deletingUser.name}?`}
                        message="Are you sure you want to permanently delete this user? This action cannot be undone."
                        confirmText="Delete"
                        onConfirm={handleDeleteConfirm}
                        onClose={() => setDeletingUser(null)}
                        isDestructive
                    />
                )}
            </AnimatePresence>
            <div className="flex space-x-2 border-b border-slate-200">
                <TabButton tab="Users" label="Users" />
                <TabButton tab="Permissions" label="Role Permissions" />
            </div>
            {activeTab === 'Users' ? renderUsers() : renderPermissions()}
        </div>
    );
};

export default UsersPermissionsSettings;