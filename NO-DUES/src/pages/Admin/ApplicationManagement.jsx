import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Loader2, FileText, MapPin, 
  Settings2, Filter, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ApplicationDetailModal from './ApplicationDetailModal';

const ApplicationManagement = () => {
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await authFetch('/api/approvals/all'); 
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [authFetch]);

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.display_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || app.status === statusFilter);
  });

  // --- Skeleton Row Component for Loading State ---
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-10 py-7">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-7">
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </td>
      <td className="px-6 py-7">
        <div className="h-6 w-20 bg-slate-100 rounded-xl" />
      </td>
      <td className="px-10 py-7 text-right">
        <div className="h-10 w-36 bg-slate-200 rounded-2xl ml-auto" />
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Application Control</h1>
          <p className="text-slate-500 text-sm mt-1">Admin override panel for system-wide clearance states.</p>
        </div>
        <button 
          onClick={() => fetchApplications()} 
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
        >
          <RefreshCw className={`h-5 w-5 text-slate-500 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search student identity..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="py-4 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Identity</th>
                <th className="px-6 py-6">Current Progress</th>
                <th className="px-6 py-6">Global Status</th>
                <th className="px-10 py-6 text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {loading ? (
                // ✅ Show 5 skeleton rows while fetching data
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <tr key={app.application_id} className="group hover:bg-blue-50/20 transition-colors">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-lg group-hover:bg-blue-600 transition-all duration-300">
                          {app.student_name?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 tracking-tight text-base">{app.student_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.roll_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <MapPin size={14} className="text-blue-500" />
                        {app.current_location}
                      </div>
                    </td>
                    <td className="px-6 py-7">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                        app.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                      >
                        Manage Workflow <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center text-slate-400 font-bold">
                    No matching applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <ApplicationDetailModal 
          isOpen={!!selectedApp} 
          onClose={() => {
            setSelectedApp(null);
            fetchApplications(true); 
          }} 
          application={selectedApp}
        />
      )}
    </div>
  );
};

export default ApplicationManagement;