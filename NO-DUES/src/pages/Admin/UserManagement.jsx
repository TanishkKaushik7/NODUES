import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserPlus, Filter, MoreVertical, Edit2, 
  Trash2, Shield, Mail, Loader2, RefreshCw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RegisterUserModal from './RegisterUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const UserManagement = () => {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal & Selection States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [deletingUser, setDeletingUser] = useState(null); 
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);

  // ✅ Mapping for Schools (Academic)
  const getSchoolCode = (id) => {
    const schools = { 
      1: "SOICT", 2: "SOM", 3: "SOE", 
      4: "SOBT", 5: "SOVSAS", 6: "SOHSS" 
    };
    return schools[id] || null;
  };

  // ✅ Mapping for Departments (Authority Phases)
  const getDeptName = (id) => {
    const departments = {
      1: "Library",
      2: "Hostel",
      3: "Sports",
      4: "Laboratories",
      5: "CRC",
      6: "Accounts"
    };
    return departments[id] || null;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ ...(roleFilter && { role: roleFilter }) }).toString();
      const response = await authFetch(`/api/admin/users?${query}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [authFetch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsRegisterModalOpen(true);
    setActiveActionId(null);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleteLoading(true);
    try {
      const response = await authFetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
        setDeletingUser(null);
        setActiveActionId(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStyle = (role) => {
    const styles = {
      super_admin: 'bg-slate-900 text-white border-slate-900',
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      student: 'bg-blue-100 text-blue-700 border-blue-200',
      dean: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      library: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      hostel: 'bg-orange-100 text-orange-700 border-orange-200',
      lab: 'bg-pink-100 text-pink-700 border-pink-200',
      account: 'bg-red-100 text-red-700 border-red-200',
      sports: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      crc: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return styles[role] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm mt-1">Manage system access for {users.length} users.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchUsers} className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
            onClick={() => { setEditingUser(null); setIsRegisterModalOpen(true); }} 
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
           >
             <UserPlus className="h-4 w-4 mr-2" /> Register New User
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <select 
            className="w-full pl-10 pr-8 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-slate-600 uppercase tracking-tight"
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <optgroup label="System">
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="super_admin">Super Admin</option>
            </optgroup>
            <optgroup label="Authorities">
                <option value="dean">Dean</option>
                <option value="library">Library</option>
                <option value="hostel">Hostel</option>
                <option value="account">Account</option>
                <option value="lab">Lab</option>
                <option value="sports">Sports</option>
                <option value="crc">CRC</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Identification</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Allocation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-400 mt-4 font-bold uppercase text-[10px] tracking-widest">Accessing Database...</p>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-white shadow-sm">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getRoleStyle(user.role)}`}>
                      <Shield className="h-3 w-3 mr-1.5 opacity-70" /> {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex flex-col">
                       <span className="font-bold text-slate-700 tracking-tight">
                         {/* ✅ Logic: Show School Code or Department Name */}
                         {user.school_id ? getSchoolCode(user.school_id) : (getDeptName(user.department_id) || user.department_name || 'N/A')}
                       </span>
                       <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                         {user.school_id ? 'Academic School' : 'Department/Authority'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveActionId(activeActionId === user.id ? null : user.id)}
                      className="text-slate-300 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {activeActionId === user.id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveActionId(null)} />
                        <div className="absolute right-6 top-12 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                          </button>
                          <button 
                            onClick={() => setDeletingUser({ id: user.id, name: user.name })}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove User
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ MODALS */}
      <RegisterUserModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => { setIsRegisterModalOpen(false); setEditingUser(null); }} 
        onSuccess={fetchUsers} 
        initialData={editingUser} 
      />

      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        userName={deletingUser?.name}
        isLoading={isDeleteLoading}
      />
    </div>
  );
};

export default UserManagement;