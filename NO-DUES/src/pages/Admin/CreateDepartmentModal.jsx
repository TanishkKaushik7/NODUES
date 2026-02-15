import React, { useState, useEffect } from 'react';
import { X, Building2, Loader2, CheckCircle2, AlertCircle, Layers, Landmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ✅ New State for Schools List
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phase_number: 1, // Default: Phase 1 (Academic)
    school_code: ''  // ✅ Store selected School Code
  });

  // ✅ 1. Fetch Schools on Mount (Using authFetch for correct Base URL)
  useEffect(() => {
    if (isOpen) {
      const fetchSchools = async () => {
        setSchoolsLoading(true);
        try {
          // Use authFetch to guarantee we hit the correct API URL
          const res = await authFetch('/api/common/schools');
          if (res.ok) {
            setSchoolOptions(await res.json());
          } else {
            console.error("Failed to fetch schools, status:", res.status);
          }
        } catch (err) {
          console.error("Failed to load schools", err);
        } finally {
          setSchoolsLoading(false);
        }
      };
      fetchSchools();
    }
  }, [isOpen, authFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ 2. Validate School Selection for Phase 1
      if (formData.phase_number === 1 && !formData.school_code) {
        throw new Error("Academic Departments must be linked to a School.");
      }

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        phase_number: parseInt(formData.phase_number),
        // Send school_code only if Academic
        school_code: formData.phase_number === 1 ? formData.school_code : null
      };

      const response = await authFetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        throw new Error(msg || 'Failed to create department');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({ name: '', code: '', phase_number: 1, school_code: '' });
        setShowSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Wrapper - Fixed Height Issues */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100 relative overflow-hidden">
        
        {/* Header (Fixed) */}
        <div className="relative px-8 py-6 text-center bg-indigo-50/30 border-b border-indigo-50 shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-all shadow-sm z-10">
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex p-3 bg-white rounded-[1.2rem] mb-3 shadow-sm border border-indigo-50">
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Add Department</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Configure Academic or Admin Unit</p>
        </div>

        {/* Scrollable Content Area */}
        {showSuccess ? (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center">
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-6" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Department Created</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">System Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 text-[11px] rounded-2xl flex items-center gap-3 border border-rose-100 font-black uppercase tracking-wider animate-in shake-in">
                  <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
                </div>
              )}

              {/* Code & Name Inputs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                  <input 
                    type="text" placeholder="CSE" required maxLength={10}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all uppercase font-mono tracking-wider text-center"
                    value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="col-span-2 space-y-2 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                  <input 
                    type="text" placeholder="e.g. Computer Science" required 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Sequence Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Layers size={12} /> Approval Workflow Phase
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { val: 1, label: "Phase 1: Academic", desc: "Linked to School (e.g. CSE -> SOICT)" },
                    { val: 2, label: "Phase 2: Admin", desc: "Parallel (Library, Sports, Hostel)" },
                    { val: 3, label: "Phase 3: Accounts", desc: "Final Clearance (Finance Only)" }
                  ].map((option) => (
                    <button
                      key={option.val} type="button"
                      onClick={() => setFormData({...formData, phase_number: option.val, school_code: ''})}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                        formData.phase_number === option.val 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className={`text-xs font-black uppercase tracking-wider truncate ${formData.phase_number === option.val ? 'text-white' : 'text-slate-700'}`}>{option.label}</p>
                        <p className={`text-[10px] font-medium mt-0.5 truncate ${formData.phase_number === option.val ? 'text-indigo-100' : 'text-slate-400'}`}>{option.desc}</p>
                      </div>
                      {formData.phase_number === option.val && <CheckCircle2 className="h-5 w-5 text-indigo-200 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ School Dropdown (Phase 1 Only) */}
              {formData.phase_number === 1 && (
                <div className="space-y-2 animate-in slide-in-from-top-2 pt-2">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Landmark size={12} /> Assign to School (Required)
                  </label>
                  <div className="relative">
                    <select 
                      required 
                      className="w-full pl-5 pr-10 py-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none truncate"
                      value={formData.school_code}
                      onChange={(e) => setFormData({...formData, school_code: e.target.value})}
                      disabled={schoolsLoading}
                    >
                      <option value="">{schoolsLoading ? "Loading Schools..." : "-- Select Parent School --"}</option>
                      {schoolOptions.map(s => (
                          <option key={s.code} value={s.code} className="truncate">
                            {s.name} ({s.code})
                          </option>
                      ))}
                    </select>
                    {/* Custom Arrow to fix UI crossing */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-indigo-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-8 mt-auto">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 hover:bg-slate-50 uppercase tracking-[0.2em] transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-[1.5] px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] hover:bg-indigo-700 shadow-xl shadow-indigo-200 uppercase tracking-[0.2em] transition-all active:scale-[0.98]">{isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm'}</button>
            </div>
          </form>
        )}
      </div>
      
      {/* Scrollbar Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CreateDepartmentModal;