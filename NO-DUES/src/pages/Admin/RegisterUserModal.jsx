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
    role: 'student',
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
          role: initialData.role?.toLowerCase() || 'student',
          department_id: initialData.department_id || '',
          school_id: initialData.school_id || ''
        });
      } else {
        setFormData({ fullName: '', email: '', password: '', role: 'student', department_id: '', school_id: '' });
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
      const url = isEditMode ? `/api/admin/users/${initialData.id}` : `/api/admin/register-user`;
      const method = isEditMode ? 'PUT' : 'POST';

      const selectedDeptObj = departments.find(d => d.id === parseInt(formData.department_id));
      
      // ✅ FIX: Extract role and force to UPPERCASE as required by backend
      let roleToSend = formData.role === 'department' && selectedDeptObj 
                        ? selectedDeptObj.name 
                        : formData.role;

      const payload = {
        name: formData.fullName,
        email: formData.email,
        role: roleToSend.toLowerCase(), // ✅ Convert to lowercase
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        school_id: formData.school_id ? parseInt(formData.school_id) : null,
      };

      if (formData.password) payload.password = formData.password;

      const response = await authFetch(url, { 
        method, 
        body: JSON.stringify(payload) 
      });

      if (!response.ok) {
        const errData = await response.json();
        const detailMsg = Array.isArray(errData.detail) 
          ? errData.detail[0].msg 
          : errData.detail;
        throw new Error(detailMsg || 'Validation Error');
      }

      setShowSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDean = formData.role === 'dean';
  const isDeptCategory = formData.role === 'department';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        
        <div className={`relative px-6 py-8 text-center border-b border-slate-100 ${isEditMode ? 'bg-indigo-50/50' : 'bg-slate-50/50'}`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
          <div className={`inline-flex p-3 rounded-2xl mb-4 shadow-inner ${isEditMode ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
            {isEditMode ? <Edit3 className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? 'Update Profile' : 'Register User'}
          </h3>
        </div>

        {showSuccess ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Success!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[10px] rounded-xl flex items-start gap-2 border border-red-100 font-bold uppercase">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> 
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <input 
                type="text" placeholder="Full Name" required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="email" placeholder="Email Address" required 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Shield className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select 
                    className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-700 uppercase"
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value, school_id: '', department_id: ''})}
                  >
                    <optgroup label="System Roles">
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="staff">Staff</option>
                    </optgroup>
                    <optgroup label="Academic Authority">
                      <option value="dean">Dean</option>
                      <option value="department">Department</option>
                    </optgroup>
                  </select>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder={isEditMode ? "New Password" : "Password"} 
                    required={!isEditMode}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>

              {isDean && (
                <div className="relative animate-in slide-in-from-top-2">
                  <Landmark className="absolute left-4 top-3.5 h-4 w-4 text-indigo-500" />
                  <select 
                    required 
                    className="w-full pl-11 pr-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.school_id}
                    onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                  >
                    <option value="">Select Academic School</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.code} — {school.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {isDeptCategory && (
                <div className="relative animate-in slide-in-from-top-2">
                  <Building2 className="absolute left-4 top-3.5 h-4 w-4 text-blue-500" />
                  <select 
                    required 
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">Select Dept. Authority</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 uppercase">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading} 
                className={`flex-[1.5] px-4 py-3 text-white rounded-xl font-bold text-xs disabled:opacity-50 uppercase ${isEditMode ? 'bg-indigo-600' : 'bg-slate-900'}`}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (isEditMode ? 'Update Profile' : 'Create Account')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterUserModal;