import React, { useState, useEffect } from 'react';
import { X, Building2, User, Loader2 } from 'lucide-react';

const CreateSchoolModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deanName: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', deanName: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call (POST /api/admin/schools)
    setTimeout(() => {
      console.log("Creating School:", formData);
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
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg">Create New School</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* School Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. School of Engineering"
                className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <p className="text-xs text-slate-500">The full official name of the school.</p>
          </div>

          {/* Dean Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Dean Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jane Smith"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.deanName}
                onChange={(e) => setFormData({...formData, deanName: e.target.value})}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
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
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create School'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateSchoolModal;