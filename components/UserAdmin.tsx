import React, { useState } from 'react';
import type { User, Branch } from '../types';

interface UserAdminProps {
  users: User[];
  branches: Branch[];
  onCreateUser: (userData: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
}

const UserAdmin: React.FC<UserAdminProps> = ({ users, branches, onCreateUser, onDeleteUser, currentUser }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Staff');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
        return;
    }
    if (role === 'Staff' && !branchId) {
        // Handle error: Staff must have a clinic
        return;
    }
    onCreateUser({
        name,
        username,
        password,
        role,
        branchId: role === 'Staff' ? branchId : undefined
    });
    // Reset form
    setName('');
    setUsername('');
    setPassword('');
    setRole('Staff');
    setBranchId(branches[0]?.id || '');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">User Accounts</h2>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="border-b-2 border-white/30 sticky top-0 bg-black/20 backdrop-blur-lg">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Username</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase">Assigned Clinic</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="py-4 px-4 font-medium text-gray-100">
                    <div className="truncate max-w-xs" title={user.name}>{user.name}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-300">
                    <div className="truncate max-w-xs" title={user.username}>{user.username}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{user.role}</td>
                  <td className="py-4 px-4 text-gray-300">{user.branchId ? branches.find(b => b.id === user.branchId)?.name : 'N/A'}</td>
                  <td className="py-4 px-4 text-center">
                    <button 
                        onClick={() => onDeleteUser(user.id)} 
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentUser.id === user.id}
                        title={currentUser.id === user.id ? "Cannot delete yourself" : "Delete User"}
                    >
                        Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Create User Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="staffName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input id="staffName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
          </div>
          <div>
            <label htmlFor="staffUsername" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input id="staffUsername" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. janedoe" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
          </div>
          <div>
            <label htmlFor="staffPassword"className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input id="staffPassword" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required />
          </div>
           <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value as 'Admin' | 'Staff')} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required>
              <option value="Staff" className="bg-gray-800">Staff</option>
              <option value="Admin" className="bg-gray-800">Admin</option>
            </select>
          </div>
          {role === 'Staff' && (
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">Assign to Clinic</label>
              <select id="branch" value={branchId} onChange={e => setBranchId(e.target.value)} className="w-full px-4 py-2 bg-black/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 transition" required>
                {branches.map(b => <option key={b.id} value={b.id} className="bg-gray-800">{b.name}</option>)}
              </select>
            </div>
          )}
          <div className="pt-2">
            <button type="submit" className="w-full bg-blue-500/50 text-white font-bold py-3 rounded-lg border border-blue-400 hover:bg-blue-500/80 transition">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAdmin;