import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, GraduationCap, Plus, Trash2, Edit2, 
  Search, Landmark, MoreVertical, RefreshCw, Loader2, 
  ShieldCheck, AlertCircle, ChevronLeft, ChevronRight,
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CreateSchoolModal from './CreateSchoolModal';
import CreateDepartmentModal from './CreateDepartmentModal';
import DeleteStructureModal from './DeleteStructureModal';

const SchoolDeptManagement = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('academic'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [schools, setSchools] = useState([]);
  const [centralDepts, setCentralDepts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  
  // ✅ Improved Delete State
  const [deleteConfig, setDeleteConfig] = useState({ 
    isOpen: false, 
    id: null, 
    name: '', 
    type: '' // 'school' or 'dept'
  });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [schoolRes, deptRes] = await Promise.all([
        authFetch('/api/admin/schools'),
        authFetch('/api/admin/departments')
      ]);
      
      if (schoolRes.ok && deptRes.ok) {
        setSchools(await schoolRes.json());
        setCentralDepts(await deptRes.json());
      } else {
        throw new Error("Failed to synchronize with server.");
      }
    } catch (error) {
      setError("Unable to load university structure.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ✅ NEW: Robust Delete Confirmation Logic
  const handleDeleteConfirm = async () => {
    if (!deleteConfig.id) return;
    
    setIsDeleteLoading(true);
    try {
      // Determine endpoint based on type
      const endpoint = deleteConfig.type === 'school' 
        ? `/api/admin/schools/${deleteConfig.id}`
        : `/api/admin/departments/${deleteConfig.id}`;

      const response = await authFetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteConfig({ isOpen: false, id: null, name: '', type: '' });
        fetchData(); // Refresh the lists
      } else {
        const errData = await response.json();
        // Handle cases where deletion is blocked by foreign keys
        alert(errData.detail || `Cannot delete this ${deleteConfig.type}. It may have linked records.`);
      }
    } catch (err) {
      console.error("Delete operation failed:", err);
      alert("A network error occurred while trying to delete.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (activeTab === 'academic') {
      return schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return centralDepts.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, schools, centralDepts, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const initiateDelete = (id, name, type) => setDeleteConfig({ isOpen: true, id, name, type });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">University Structure</h1>
          <p className="text-slate-500 text-sm mt-1">Manage institutional hierarchy and administrative units.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 px-5 shadow-sm flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Schools</p>
              <p className="text-lg font-black text-indigo-600">{schools.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Depts</p>
              <p className="text-lg font-black text-emerald-600">{centralDepts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex w-full md:w-auto gap-1">
          <button 
            onClick={() => handleTabChange('academic')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'academic' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <GraduationCap className="h-4 w-4" /> Academic
          </button>
          <button 
            onClick={() => handleTabChange('central')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'central' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck className="h-4 w-4" /> Central
          </button>
        </div>

        <button 
          onClick={() => activeTab === 'academic' ? setIsSchoolModalOpen(true) : setIsDeptModalOpen(true)}
          className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'academic' ? 'School' : 'Dept'}
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {paginatedItems.map((item) => (
            <div key={item.id} className="p-4 px-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 ${activeTab === 'academic' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                  {activeTab === 'academic' ? <Landmark className="h-6 w-6" /> : <Layers className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">{item.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.code}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => initiateDelete(item.id, item.name, activeTab === 'academic' ? 'school' : 'dept')}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateSchoolModal isOpen={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} onSuccess={fetchData} />
      <CreateDepartmentModal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} onSuccess={fetchData} />
      
      <DeleteStructureModal 
        isOpen={deleteConfig.isOpen} 
        onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })} 
        onConfirm={handleDeleteConfirm} // ✅ Correct Confirm Handler
        itemName={deleteConfig.name} 
        itemType={deleteConfig.type} 
        isLoading={isDeleteLoading} 
      />
    </div>
  );
};

export default SchoolDeptManagement;