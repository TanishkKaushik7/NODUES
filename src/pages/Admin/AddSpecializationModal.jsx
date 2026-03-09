import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Layers, AlertCircle, ChevronRight } from 'lucide-react';

const AddSpecializationModal = ({ isOpen, onClose, onSuccess, authFetch }) => {
  const [formData, setFormData] = useState({ name: '', code: '', programmeCode: '' });
  
  // Logic States
  const [selectedDept, setSelectedDept] = useState(''); // Filter Step 1
  const [deptOptions, setDeptOptions] = useState([]);
  const [progOptions, setProgOptions] = useState([]); // Filter Step 2
  
  // UI States
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isLoadingProgs, setIsLoadingProgs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // 1. Fetch Academic Departments on Open
  useEffect(() => {
    if (isOpen) {
      const fetchDepts = async () => {
        setIsLoadingDepts(true);
        try {
          const res = await authFetch('/api/common/departments?type=academic');
          if (res.ok) {
            const data = await res.json();
            setDeptOptions(data);
          }
        } catch (err) {
          console.error(err);
          setFetchError("Failed to load departments");
        } finally {
          setIsLoadingDepts(false);
        }
      };
      fetchDepts();
      // Reset states
      setSelectedDept('');
      setProgOptions([]);
      setFormData({ name: '', code: '', programmeCode: '' });
    }
  }, [isOpen]);

  // 2. Fetch Programmes when Department changes
  useEffect(() => {
    if (!selectedDept) {
        setProgOptions([]);
        setFormData(prev => ({ ...prev, programmeCode: '' }));
        return;
    }

    const fetchProgs = async () => {
        setIsLoadingProgs(true);
        try {
            const res = await authFetch(`/api/common/programmes?department_code=${selectedDept}`);
            if (res.ok) {
                const data = await res.json();
                setProgOptions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingProgs(false);
        }
    };
    fetchProgs();
  }, [selectedDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/admin/specializations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase().trim(),
          programme_code: formData.programmeCode
        })
      });

      if (res.ok) {
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
                 <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Layers size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Specialization</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Academic Hierarchy</p>
                 </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              
              {/* --- Filter Step 1: Department --- */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Department</label>
                <div className="relative">
                    <select 
                      className="w-full h-12 px-5 appearance-none rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all outline-none cursor-pointer text-slate-700"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      disabled={isLoadingDepts}
                    >
                        {isLoadingDepts ? <option>Loading...</option> : <option value="">Select Department</option>}
                        {deptOptions.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {isLoadingDepts ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
                    </div>
                </div>
              </div>

              {/* --- Filter Step 2: Programme --- */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Parent Programme <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <select 
                      required
                      className="w-full h-12 px-5 appearance-none rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all outline-none cursor-pointer text-slate-700 disabled:opacity-50"
                      value={formData.programmeCode}
                      onChange={(e) => setFormData({...formData, programmeCode: e.target.value})}
                      disabled={!selectedDept || isLoadingProgs}
                    >
                        {!selectedDept ? (
                            <option>Select a Department first</option>
                        ) : isLoadingProgs ? (
                            <option>Loading Programmes...</option>
                        ) : progOptions.length === 0 ? (
                            <option>No programmes found</option>
                        ) : (
                            <option value="">Select Programme</option>
                        )}
                        {progOptions.map(p => (
                            <option key={p.code} value={p.code}>
                                {p.name} ({p.code})
                            </option>
                        ))}
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Specialization Name */}
                <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization Name</label>
                    <input 
                    required
                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all outline-none"
                    placeholder="e.g. Artificial Intelligence"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* Unique Code */}
                <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Code</label>
                    <input 
                    required
                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold transition-all outline-none uppercase placeholder:normal-case"
                    placeholder="e.g. AIML"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.programmeCode}
                  className="flex-[2] h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Create Specialization</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddSpecializationModal;