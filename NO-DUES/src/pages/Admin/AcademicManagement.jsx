import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Plus, Search, Trash2, 
  BookOpen, Layers, Filter, AlertCircle, Loader2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AcademicManagement = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('programmes');
  const [loading, setLoading] = useState(true);
  const [programmes, setProgrammes] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', parentCode: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ UPDATED: Points to Admin API endpoints
      const endpoint = activeTab === 'programmes' ? '/api/admin/programmes' : '/api/admin/specializations';
      const res = await authFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        activeTab === 'programmes' ? setProgrammes(data) : setSpecializations(data);
      }
    } catch (error) {
      console.error("Failed to fetch academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ✅ UPDATED: Payload matches the Pydantic Schemas (ProgrammeCreate / SpecializationCreate)
      const payload = activeTab === 'programmes' 
        ? { name: formData.name, code: formData.code, department_code: formData.parentCode }
        : { name: formData.name, code: formData.code, programme_code: formData.parentCode };

      const endpoint = activeTab === 'programmes' ? '/api/admin/programmes' : '/api/admin/specializations';
      
      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', code: '', parentCode: '' });
        fetchData();
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

  const handleDelete = async (identifier) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'programmes' ? 'Programme' : 'Specialization'}?`)) return;

    try {
      // ✅ UPDATED: Points to Admin API endpoints
      const endpoint = activeTab === 'programmes' 
        ? `/api/admin/programmes/${identifier}` 
        : `/api/admin/specializations/${identifier}`;
        
      const res = await authFetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.detail || "Cannot delete record. It may be linked to students.");
      }
    } catch (error) {
      alert("Delete request failed");
    }
  };

  const filteredData = (activeTab === 'programmes' ? programmes : specializations).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Academic Structure</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Manage Programmes & Specializations
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add {activeTab === 'programmes' ? 'Programme' : 'Specialization'}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-full lg:w-fit">
          <button 
            onClick={() => setActiveTab('programmes')}
            className={`flex-1 lg:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'programmes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Programmes
          </button>
          <button 
            onClick={() => setActiveTab('specializations')}
            className={`flex-1 lg:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'specializations' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Specializations
          </button>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {activeTab === 'programmes' ? 'Dept ID' : 'Prog ID'}
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">Loading data...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          {activeTab === 'programmes' ? <BookOpen size={14} /> : <Layers size={14} />}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">
                      #{activeTab === 'programmes' ? item.department_id : item.programme_id}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(item.code)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <AlertCircle className="h-8 w-8 text-slate-200 mx-auto" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">No records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  New {activeTab === 'programmes' ? 'Programme' : 'Specialization'}
                </h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                  Enter details for the academic database
                </p>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none"
                    placeholder={activeTab === 'programmes' ? "e.g. B.Tech (CSE)" : "e.g. Artificial Intelligence"}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Code</label>
                    <input 
                      required
                      className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none"
                      placeholder="e.g. BTECH_CSE"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {activeTab === 'programmes' ? 'Dept Code' : 'Prog Code'}
                    </label>
                    <input 
                      required
                      className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none"
                      placeholder={activeTab === 'programmes' ? "e.g. SOICT" : "e.g. BTECH_CSE"}
                      value={formData.parentCode}
                      onChange={(e) => setFormData({...formData, parentCode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span>Confirm Creation</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicManagement;