import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Mail, Lock, Shield, 
  Building2, Loader2, CheckCircle2, AlertCircle, 
  Landmark, Edit3 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterUserModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!initialData;

  const schools = [
    { id: 1, name: "School of ICT", code: "SOICT" },
    { id: 2, name: "School of Management", code: "SOM" },
    { id: 3, name: "School of Engineering", code: "SOE" },
    { id: 4, name: "School of Biotechnology", code: "SOBT" },
    { id: 5, name: "School of VSAS", code: "SOVSAS" },
    { id: 6, name: "School of SOHSS", code: "SOHSS" }
  ];

  const departments = [
    { id: 1, name: "library" },
    { id: 2, name: "hostel" },
    { id: 3, name: "sports" },
    { id: 4, name: "lab" },
    { id: 5, name: "crc" },
    { id: 6, name: "account" }
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'staff', 
    department_id: '',
    school_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          fullName: initialData.name || '',
          email: initialData.email || '',
          password: '', 
          role: initialData.role?.toLowerCase() || 'staff',
          department_id: initialData.department_id || '',
          school_id: initialData.school_id || ''
        });
      } else {
        setFormData({ fullName: '', email: '', password: '', role: 'staff', department_id: '', school_id: '' });
      }
      setShowSuccess(false);
      setError(null);
    }
  }, [isOpen, initialData, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const normalizedRole = formData.role.toLowerCase();
      
      // Determine final role string for department selection
      const selectedDeptObj = departments.find(d => d.id === parseInt(formData.department_id));
      let roleToSubmit = normalizedRole;
      if (normalizedRole === 'department' && selectedDeptObj) {
        roleToSubmit = selectedDeptObj.name;
      }

      // ✅ DYNAMIC ENDPOINT SELECTION
      let url = '';
      let method = 'POST';

      if (isEditMode) {
        url = `/api/admin/users/${initialData.id}`;
        method = 'PUT';
      } else {
        url = normalizedRole === 'admin' 
            ? '/api/admin/register-admin' // Specific endpoint from your backend snippet
            : '/api/admin/register-user'; 
      }

      // ✅ PAYLOAD CLEANING: Admin specifically needs nulls for these fields
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: normalizedRole === 'department' ? roleToSubmit : normalizedRole, 
        department_id: normalizedRole === 'staff' ? parseInt(formData.department_id) : null,
        school_id: normalizedRole === 'dean' ? parseInt(formData.school_id) : null,
      };

      if (isEditMode && !formData.password) delete payload.password;

      const response = await authFetch(url, { 
        method, 
        body: JSON.stringify(payload) 
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        throw new Error(msg || 'Operation failed');
      }

      setShowSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        <div className={`px-6 py-10 text-center border-b border-slate-100 ${isEditMode ? 'bg-indigo-50/30' : 'bg-slate-50/30'}`}>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
          <div className="inline-flex p-4 rounded-[1.5rem] bg-white shadow-sm mb-4 border border-slate-50">
             {isEditMode ? <Edit3 className="text-indigo-600 h-6 w-6" /> : <UserPlus className="text-blue-600 h-6 w-6" />}
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {isEditMode ? 'Update User' : 'Register User'}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Staff Access Management</p>
        </div>

        {showSuccess ? (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500">
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Success</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Account Synchronized</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] rounded-2xl flex items-center gap-3 border border-red-100 font-black uppercase tracking-wider animate-in shake-in">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <input 
                type="text" placeholder="Full Name" required 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="email" placeholder="Official Email" required 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select 
                    className="w-full pl-10 pr-2 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer"
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value, department_id: '', school_id: ''})}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="dean">Dean</option>
                    <option value="department">Dept Authority (Permanent)</option>
                  </select>
                </div>
                <input 
                  type="password" 
                  placeholder={isEditMode ? "Change PW" : "Password"} 
                  required={!isEditMode}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white outline-none"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              {formData.role === 'dean' && (
                <div className="relative animate-in slide-in-from-top-2">
                  <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <select 
                    required className="w-full pl-12 pr-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-black uppercase tracking-tight outline-none"
                    value={formData.school_id} onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                  >
                    <option value="">Select School</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* ✅ Staff or Department logic */}
              {(formData.role === 'staff' || formData.role === 'department') && (
                <div className="relative animate-in slide-in-from-top-2">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <select 
                    required className="w-full pl-12 pr-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-black uppercase tracking-tight outline-none"
                    value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">Assign Dept</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 hover:bg-slate-50 uppercase tracking-[0.2em]">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="flex-[1.5] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 disabled:opacity-50 transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditMode ? 'Update' : 'Confirm')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterUserModal;