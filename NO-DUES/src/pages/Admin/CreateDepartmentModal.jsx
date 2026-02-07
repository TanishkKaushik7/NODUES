import React, { useState } from 'react';
import { X, Building2, Loader2, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phase_number: 2 // Default: Academic (HOD)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase(), // Enforce Uppercase Code
          phase_number: parseInt(formData.phase_number)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create department');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({ name: '', code: '', phase_number: 2 });
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
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="relative px-8 py-8 text-center bg-slate-50/50 border-b border-slate-100">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4 shadow-sm border border-indigo-100">
            <Building2 className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Add Department</h3>
          <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wide">Configure Academic or Admin Unit</p>
        </div>

        {showSuccess ? (
          <div className="p-12 text-center animate-in fade-in scale-in">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-100 shadow-sm">
               <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Department Created</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">System Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-[11px] rounded-2xl flex items-start gap-3 border border-rose-100 font-bold leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> 
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {/* Department Code */}
                <div className="col-span-1 space-y-2 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                    Code
                  </label>
                  <input 
                    type="text" 
                    placeholder="CSE" 
                    required 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 uppercase font-mono tracking-wider text-center"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>

                {/* Department Name */}
                <div className="col-span-2 space-y-2 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                    Official Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Computer Science" 
                    required 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* FLOW B SEQUENCE SELECTION */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Layers size={12} /> Workflow Sequence Assignment
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: 2, label: "Academic (Seq 2)", desc: "For HOD Approval (CSE, IT, etc.)" },
                    { val: 4, label: "Administrative (Seq 4)", desc: "Parallel Authority (Library, Sports, Hostel)" },
                    { val: 5, label: "Final (Seq 5)", desc: "Final Clearance (Accounts Only)" }
                  ].map((option) => (
                    <button
                      key={option.val}
                      type="button"
                      onClick={() => setFormData({...formData, phase_number: option.val})}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
                        formData.phase_number === option.val 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-black uppercase tracking-wider ${formData.phase_number === option.val ? 'text-white' : 'text-slate-700'}`}>
                          {option.label}
                        </p>
                        <p className={`text-[10px] font-medium mt-0.5 ${formData.phase_number === option.val ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {option.desc}
                        </p>
                      </div>
                      {formData.phase_number === option.val && (
                        <CheckCircle2 className="h-5 w-5 text-indigo-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-[1.5] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Department'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDepartmentModal;