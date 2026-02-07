import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, GraduationCap, Plus, Trash2, Edit2, 
  ChevronDown, ChevronRight, Search, Landmark,
  MoreVertical, RefreshCw, Loader2, ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CreateSchoolModal from './CreateSchoolModal';
import CreateDepartmentModal from './CreateDepartmentModal';
import DeleteStructureModal from './DeleteStructureModal';

const SchoolDeptManagement = () => {
  const { authFetch } = useAuth();
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data States
  const [schools, setSchools] = useState([]);
  const [centralDepts, setCentralDepts] = useState([]);

  // Modal States
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  
  // Deletion State
  const [deleteConfig, setDeleteConfig] = useState({ 
    isOpen: false, 
    id: null, 
    name: '', 
    type: '' 
  });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Fetch University Structure
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [schoolRes, deptRes] = await Promise.all([
        authFetch('/api/admin/schools'),
        authFetch('/api/admin/departments')
      ]);
      
      if (schoolRes.ok && deptRes.ok) {
        const schoolData = await schoolRes.json();
        const deptData = await deptRes.json();
        setSchools(schoolData);
        setCentralDepts(deptData);
      } else {
        throw new Error("Failed to synchronize with server.");
      }
    } catch (error) {
      console.error("Failed to fetch structure:", error);
      setError("Unable to load university structure. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSchool = (id) => {
    setExpandedSchool(expandedSchool === id ? null : id);
  };

  const initiateDelete = (id, name, type) => {
    setDeleteConfig({ isOpen: true, id, name, type });
  };

  const handleConfirmedDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const endpoint = deleteConfig.type === 'school' 
        ? `/api/admin/schools/${deleteConfig.id}` 
        : `/api/admin/departments/${deleteConfig.id}`;
        
      const res = await authFetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        fetchData(); 
        setDeleteConfig({ ...deleteConfig, isOpen: false });
      } else {
        const errData = await res.json();
        alert(`Delete failed: ${errData.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Delete error", err);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Filter Logic
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    school.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCentralDepts = centralDepts.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Synchronizing Structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">University Structure</h1>
          <p className="text-slate-500 text-sm mt-1">Configure Academic Schools and Central Administrative Authorities.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </button>
          <button 
            onClick={() => setIsSchoolModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Landmark className="h-4 w-4 mr-2 text-indigo-600" />
            Add School
          </button>
          <button 
            onClick={() => setIsDeptModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by school name, code, or central department..." 
          className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none bg-white shadow-sm transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Academic Schools (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Academic Schools</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredSchools.length} Total</span>
          </div>
          
          <div className="grid gap-3">
            {filteredSchools.map((school) => (
              <div 
                key={school.id} 
                className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedSchool === school.id ? 'border-indigo-300 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-200 hover:border-indigo-200 shadow-sm'}`}
              >
                <div 
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => toggleSchool(school.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${expandedSchool === school.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 tracking-tight">{school.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter bg-indigo-50 px-2 py-0.5 rounded">
                          {school.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {school.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={(e) => { e.stopPropagation(); }}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                       >
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           initiateDelete(school.id, school.name, 'school'); 
                         }}
                         className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                    {expandedSchool === school.id ? <ChevronDown className="h-5 w-5 text-indigo-500" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Central Authorities (1/3 width) */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Central Departments</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredCentralDepts.length}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            <div className="overflow-y-auto custom-scrollbar divide-y divide-slate-50">
              {filteredCentralDepts.length > 0 ? (
                filteredCentralDepts.map((dept) => (
                  <div key={dept.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-100 shadow-sm shrink-0">
                        {dept.id}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 leading-none truncate">{dept.name}</h4>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">
                            Phase {dept.phase_number}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
                      <button 
                        onClick={() => initiateDelete(dept.id, dept.name, 'dept')}
                        className="p-2 text-slate-300 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                  No Departments Found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateSchoolModal 
        isOpen={isSchoolModalOpen} 
        onClose={() => setIsSchoolModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <CreateDepartmentModal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        onSuccess={fetchData} 
      />
      
      <DeleteStructureModal 
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
        onConfirm={handleConfirmedDelete}
        itemName={deleteConfig.name}
        itemType={deleteConfig.type}
        isLoading={isDeleteLoading}
      />
    </div>
  );
};

export default SchoolDeptManagement;