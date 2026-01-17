import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserPlus, Filter, MoreVertical, Edit2, 
  Trash2, Shield, Mail, Loader2, RefreshCw, Users // ✅ Added Users Icon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RegisterUserModal from './RegisterUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const UserManagement = () => {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // ✅ New State for Total Count
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [deletingUser, setDeletingUser] = useState(null); 
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);

  // Mapping for Schools
  const getSchoolCode = (id) => {
    const schools = { 
      1: "SOICT", 2: "SOM", 3: "SOE", 
      4: "SOBT", 5: "SOVSAS", 6: "SOHSS" 
    };
    return schools[id] || null;
  };

  // Mapping for Departments
  const getDeptName = (id) => {
    const departments = {
      1: "Library", 2: "Hostel", 3: "Sports",
      4: "Laboratories", 5: "CRC", 6: "Accounts"
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
        
        // ✅ FIX: Handle the { total, users } structure correctly
        if (data.users && Array.isArray(data.users)) {
            setUsers(data.users);
            setTotalUsers(data.total || data.users.length); // Set total from API or length
        } else if (Array.isArray(data)) {
            // Fallback in case API just returns an array
            setUsers(data);
            setTotalUsers(data.length);
        } else {
            setUsers([]);
            setTotalUsers(0);
        }
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
        setTotalUsers(prev => prev - 1); // ✅ Decrease count on delete
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
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Maintain and audit university staff, student, and authority accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
           {/* ✅ NEW: Total Users Display */}
           <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl mr-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">
                Total: {totalUsers}
              </span>
           </div>

           <button onClick={fetchUsers} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
            onClick={() => { setEditingUser(null); setIsRegisterModalOpen(true); }} 
            className="flex items-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
           >
             <UserPlus className="h-4 w-4 mr-2" /> Register User
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by full name or institutional email..." 
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[220px]">
          <Filter className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <select 
            className="w-full pl-11 pr-8 py-3.5 border border-slate-200 rounded-2xl text-xs bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-black text-slate-600 uppercase tracking-widest cursor-pointer"
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Account Roles</option>
            <optgroup label="Core System">
                <option value="admin">Admin</option>
                <option value="student">Student</option>
            </optgroup>
            <optgroup label="Departmental Authorities">
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* ✅ Mobile View for Total Count (Optional, visible on small screens) */}
        <div className="md:hidden px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Registered</span>
           <span className="text-sm font-black text-slate-800">{totalUsers}</span>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Identification</th>
                <th className="px-6 py-5">Role Assigned</th>
                <th className="px-6 py-5">Unit Allocation</th>
                <th className="px-8 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-300 mx-auto" />
                    <p className="text-slate-400 mt-4 font-bold uppercase text-[10px] tracking-widest">Building Table Structure...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                 <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                       No users found
                    </td>
                 </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 tracking-tight">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${getRoleStyle(user.role)}`}>
                      <Shield className="h-3 w-3 mr-2 opacity-70" /> {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 tracking-tight">
                          {user.school_id ? getSchoolCode(user.school_id) : (getDeptName(user.department_id) || user.department_name || 'System Level')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                          {user.school_id ? 'Academic School' : (user.department_id ? 'Central Authority' : 'Global')}
                        </span>
                     </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => setActiveActionId(activeActionId === user.id ? null : user.id)}
                      className="text-slate-300 hover:text-slate-900 p-2 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {activeActionId === user.id && (
                      <div className="relative">
                        <div className="fixed inset-0 z-20" onClick={() => setActiveActionId(null)} />
                        <div className="absolute right-0 top-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-150">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="h-4 w-4 text-blue-500" /> Edit User
                          </button>
                          <div className="h-px bg-slate-50 my-1 mx-2" />
                          <button 
                            onClick={() => setDeletingUser({ id: user.id, name: user.name })}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Remove User
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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