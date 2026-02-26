import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldAlert, Activity, Search, RefreshCw, 
  Clock, Globe, Monitor, Filter, ChevronLeft, 
  ChevronRight, Eye, CheckCircle2, XCircle, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SystemLogs = () => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  /**
   * IST Formatting Logic
   */
  const formatTimestampIST = (dateString) => {
    if (!dateString) return "N/A";
    try {
      let normalizedString = dateString.replace(' ', 'T');
      if (!normalizedString.endsWith('Z') && !normalizedString.includes('+')) {
        normalizedString += 'Z';
      }
      const date = new Date(normalizedString);
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      console.error("Date Parse Error:", e);
      return dateString;
    }
  };

  const fetchLogs = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      let url = `/api/admin/system-logs?limit=500`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (eventFilter) url += `&event_type=${eventFilter}`;

      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Audit Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [authFetch, statusFilter, eventFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-6"><div className="h-5 w-40 bg-slate-100 rounded" /></td>
      <td className="px-6 py-6"><div className="h-5 w-24 bg-slate-100 rounded" /></td>
      <td className="px-6 py-6"><div className="h-5 w-32 bg-slate-100 rounded" /></td>
      <td className="px-6 py-6"><div className="h-6 w-16 bg-slate-100 rounded-lg" /></td>
      <td className="px-8 py-6 text-right"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto" /></td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="text-blue-600 h-6 w-6" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight ">Security Audit</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Real-time system event monitoring and actor tracking.</p>
        </div>
        <button 
          onClick={() => fetchLogs()} 
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
        >
          <RefreshCw className={`h-5 w-5 text-slate-500 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Filter by IP, Event, or Actor UUID..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4">
            <Activity size={16} className="text-slate-400" />
            <select 
              className="py-4 bg-transparent text-[11px] font-black  tracking-widest outline-none cursor-pointer"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="">All Events</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="STUDENT_LOGIN">Student Login</option>
              <option value="RATE_LIMIT">Rate Limit</option>
              <option value="DATA_EXPORT">Data Export</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="py-4 bg-transparent text-[11px] font-black  tracking-widest outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px]  font-black text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Timestamp & Event</th>
                <th className="px-6 py-6">Actor Role</th>
                <th className="px-6 py-6">Network Identity</th>
                <th className="px-6 py-6">Result</th>
                <th className="px-8 py-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {log.event_type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                          <Clock size={12} className="text-slate-400" /> {formatTimestampIST(log.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black  tracking-tighter border ${
                        log.actor_role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {log.actor_role || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Globe size={14} className="text-slate-400" /> {log.ip_address}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px] font-medium mt-0.5" title={log.user_agent}>
                          {log.user_agent?.split(') ')[1] || 'Unknown Agent'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {log.status === 'SUCCESS' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[11px] ">
                          <CheckCircle2 size={16} /> OK
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-black text-[11px] ">
                          <XCircle size={16} /> {log.status}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <ShieldAlert size={48} className="mb-4" />
                      <p className="font-black  tracking-widest text-sm text-slate-500">No logs match your filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-black  tracking-widest text-slate-400">
              Audit Stream: <span className="text-slate-900">{filteredLogs.length}</span> Events Captured
            </p>
            <div className="flex items-center gap-3">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[11px] font-black text-slate-600 px-2 tracking-widest">PAGE {currentPage} / {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal Component */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-[#1e40af] p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-200 text-[10px] font-black  tracking-[0.2em] mb-2">Detailed Log Record</p>
                    <h2 className="text-2xl font-black tracking-tight">{selectedLog.event_type}</h2>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400  mb-1">Status Code</p>
                    <p className={`font-black text-sm ${selectedLog.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-500'}`}>{selectedLog.status}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400  mb-1">IP Address</p>
                    <p className="font-bold text-sm text-slate-800">{selectedLog.ip_address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="text-blue-500 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 ">User Agent</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedLog.user_agent}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="text-blue-500 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 ">Actor ID (UUID)</p>
                      <p className="text-xs text-slate-600 font-mono break-all">{selectedLog.actor_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Diff Viewer */}
                {(Object.keys(selectedLog.old_values || {}).length > 0 || Object.keys(selectedLog.new_values || {}).length > 0) && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                     <p className="text-[10px] font-black text-slate-400  mb-4 flex items-center gap-2">
                       <Info size={14} /> Data Payload Comparison
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <span className="text-[9px] font-black text-red-400  px-2">Before</span>
                           <pre className="p-4 bg-slate-50 rounded-xl text-[10px] overflow-auto border border-slate-100 font-mono text-slate-500">
                             {JSON.stringify(selectedLog.old_values, null, 2)}
                           </pre>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[9px] font-black text-emerald-500  px-2">After</span>
                           <pre className="p-4 bg-emerald-50/50 rounded-xl text-[10px] overflow-auto border border-emerald-100 font-mono text-slate-700">
                             {JSON.stringify(selectedLog.new_values, null, 2)}
                           </pre>
                        </div>
                     </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black  tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemLogs;