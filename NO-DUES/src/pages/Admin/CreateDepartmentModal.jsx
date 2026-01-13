import React, { useState, useEffect } from 'react';
import { X, Building2, GraduationCap, Loader2 } from 'lucide-react';

const CreateDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    schoolId: '',
    headName: ''
  });

  // Mock Data for Schools Dropdown (In real app, fetch from GET /api/admin/schools)
  const schools = [
    { id: 1, name: "School of Engineering (SOE)" },
    { id: 2, name: "School of Management (SOM)" },
    { id: 3, name: "School of Biotechnology (SOBT)" },
    { id: 4, name: "School of ICT (SOICT)" },
    { id: 5, name: "School of Law (SOL)" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', code: '', schoolId: '', headName: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call (POST /api/admin/departments)
    setTimeout(() => {
      console.log("Creating Department:", formData);
      setIsLoading(false);
      onSuccess?.(); // Trigger refresh in parent
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg">Create Department</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* School Selection (Required) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Parent School <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                value={formData.schoolId}
                onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
              >
                <option value="" disabled>Select a School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500">The school this department belongs to.</p>
          </div>

          {/* Department Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Department Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Dept. Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              />
            </div>

            {/* Head of Department (Optional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                HOD Name
              </label>
              <input
                type="text"
                placeholder="Dr. John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.headName}
                onChange={(e) => setFormData({...formData, headName: e.target.value})}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Department'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentModal;