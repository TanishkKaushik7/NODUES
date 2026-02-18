import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, BookOpen, AlertCircle } from 'lucide-react';

const AddProgramModal = ({ isOpen, onClose, onSuccess, authFetch }) => {
  const [formData, setFormData] = useState({ name: '', code: '', departmentCode: '' });
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deptOptions, setDeptOptions] = useState([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // 1. Fetch Academic Departments on Load
  useEffect(() => {
    if (isOpen) {
      const fetchDepts = async () => {
        setIsLoadingDepts(true);
        setFetchError('');
        try {
          // ✅ Use the 'type=academic' filter to get only relevant depts
          const res = await authFetch('/api/common/departments?type=academic');
          if (res.ok) {
            const data = await res.json();
            setDeptOptions(data);
            // Auto-select first option if available
            if (data.length > 0 && !formData.departmentCode) {
               setFormData(prev => ({ ...prev, departmentCode: data[0].code }));
            }
          } else {
            setFetchError("Failed to load departments");
          }
        } catch (err) {
          console.error(err);
          setFetchError("Network error loading lists");
        } finally {
          setIsLoadingDepts(false);
        }
      };
      fetchDepts();
    }
  }, [isOpen]); // Only run when modal opens

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/admin/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase().trim(), // Standardize code
          department_code: formData.departmentCode // Send the code from dropdown
        })
      });

      if (res.ok) {
        setFormData({ name: '', code: '', departmentCode: '' });
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.detail || "Action failed");
      }
    } catch (error) {
      alert("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Programme</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Academic Database</p>
                 </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Department Dropdown (Dynamic) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <select 
                      required
                      className="w-full h-12 px-5 appearance-none rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none cursor-pointer text-slate-700"
                      value={formData.departmentCode}
                      onChange={(e) => setFormData({...formData, departmentCode: e.target.value})}
                      disabled={isLoadingDepts}
                    >
                        {isLoadingDepts ? (
                            <option>Loading Departments...</option>
                        ) : fetchError ? (
                            <option>Error loading lists</option>
                        ) : (
                            <>
                                <option value="">Select Department</option>
                                {deptOptions.map(dept => (
                                    <option key={dept.code} value={dept.code}>
                                        {dept.name} ({dept.code})
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                    {/* Loading Indicator / Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {isLoadingDepts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 rotate-45" />}
                    </div>
                </div>
                {fetchError && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 ml-1">
                        <AlertCircle size={10} /> {fetchError}
                    </p>
                )}
              </div>

              {/* Program Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none"
                  placeholder="e.g. Bachelor of Technology (CSE)"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Unique Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Code</label>
                <input 
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none uppercase placeholder:normal-case"
                  placeholder="e.g. BTECH_CSE"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
                <p className="text-[9px] font-bold text-slate-400 ml-1">Must be unique across the university.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || isLoadingDepts}
                  className="flex-[2] h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Create Programme</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddProgramModal;