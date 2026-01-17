import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Calendar, 
  CheckCircle2, XCircle, Loader2, RefreshCcw, User, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const AuditLogs = () => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    actor_role: ''
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        ...(filters.action && { action: filters.action }),
        ...(filters.actor_role && { actor_role: filters.actor_role })
      });

      const response = await authFetch(`/api/admin/audit-logs?${params}`);

      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, authFetch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action) => {
    const isApproved = action?.includes('APPROVED') || action?.includes('OVERRIDE_APPROVE');
    const isRejected = action?.includes('REJECTED');
    
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm";
    
    if (isApproved) return (
      <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-100`}>
        <CheckCircle2 className="h-3 w-3 mr-1.5" /> {action.replace('STAGE_', '').replace('ADMIN_', '')}
      </span>
    );
    if (isRejected) return (
      <span className={`${baseClasses} bg-rose-50 text-rose-700 border-rose-100`}>
        <XCircle className="h-3 w-3 mr-1.5" /> {action.replace('STAGE_', '')}
      </span>
    );
    return (
      <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-100`}>
        {action}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => 
    log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.student_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 mt-[-20px] animate-in fade-in duration-500 h-screen flex flex-col overflow-hidden p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">System Audit Logs</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time terminal oversight protocol</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95"
            title="Sync Registry"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Roll No, Actor or Remarks..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
            value={filters.actor_role}
            onChange={(e) => setFilters({...filters, actor_role: e.target.value})}
          >
            <option value="">All Roles</option>
            <option value="dean">Dean</option>
            <option value="sports">Sports</option>
            <option value="library">Library</option>
            <option value="lab">Laboratories</option>
          </select>

          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
          >
            <option value="">All Actions</option>
            <option value="STAGE_APPROVED">Approved</option>
            <option value="STAGE_REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Final Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto opacity-50" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4">Compiling Secure Registry...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    key={log.id} 
                    className="hover:bg-blue-50/50 transition-all group"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 ml-5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-white text-blue-600 flex items-center justify-center text-[10px] font-black border border-slate-200 shadow-sm uppercase">
                          {log.actor_role?.substring(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{log.actor_name || 'System User'}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.actor_role} Node</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                           {log.details?.student_roll || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 max-w-xs truncate text-xs text-slate-500 italic font-medium">
                      {log.remarks ? `"${log.remarks}"` : <span className="text-slate-300">No protocol remarks recorded</span>}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No registry entries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="shrink-0 mt-4 px-2 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
           <span>GBU Protocol v1.4.2</span>
           <span>Registry Node Status: Secure</span>
      </div>
    </div>
  );
};

export default AuditLogs;