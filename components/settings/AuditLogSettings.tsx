import React, { useState, useMemo } from 'react';
import { AuditLog, User } from '../../types';

interface AuditLogSettingsProps {
    auditLogs: AuditLog[];
    users: User[];
}

const AuditLogSettings: React.FC<AuditLogSettingsProps> = ({ auditLogs, users }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');

    const filteredLogs = useMemo(() => {
        return auditLogs
            .filter(log => selectedUser === 'all' || log.userId === selectedUser)
            .filter(log => 
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [auditLogs, searchTerm, selectedUser]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
                <select 
                    value={selectedUser}
                    onChange={e => setSelectedUser(e.target.value)}
                    className="w-full md:w-1/2 block pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                >
                    <option value="all">All Users</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.slice(0, 100).map(log => (
                             <tr key={log.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.timestamp.toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">{log.userName}</td>
                                <td className="px-6 py-4"><span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{log.action}</span></td>
                                <td className="px-6 py-4">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogSettings;