import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Calendar, MoreHorizontal,
  CheckCircle2, XCircle, Loader2, RefreshCcw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // 1. Import useAuth

const AuditLogs = () => {
  const { authFetch } = useAuth(); // 2. Extract authFetch
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

      // 3. Use authFetch - it handles Base URL and Token automatically
      const response = await authFetch(`/api/admin/audit-logs?${params}`);

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting state
        setLogs(Array.isArray(data) ? data : []);
      } else {
        console.error("Audit Logs API failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, authFetch]); // Add authFetch to dependencies

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionStyle = (action) => {
    if (action?.includes('APPROVED')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action?.includes('REJECTED')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const filteredLogs = logs.filter(log => 
    log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.student_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time tracking of clearance approvals and rejections.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchLogs}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Refresh Logs"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Roll No, Actor or Remarks..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          className="border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filters.action}
          onChange={(e) => setFilters({...filters, action: e.target.value})}
        >
          <option value="">All Actions</option>
          <option value="STAGE_APPROVED">Approved</option>
          <option value="STAGE_REJECTED">Rejected</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Remarks</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-500 mt-2 font-medium">Fetching secure logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">
                          {log.actor_role?.toUpperCase().substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{log.actor_name || 'System User'}</div>
                          <div className="text-xs text-slate-500 capitalize">{log.actor_role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionStyle(log.action)}`}>
                        {log.action === 'STAGE_APPROVED' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {log.action?.replace('STAGE_', '') || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{log.details?.student_roll || 'N/A'}</div>
                      <div className="text-xs text-slate-400">ID: {log.details?.display_id || '---'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600 italic">
                      {log.remarks ? `"${log.remarks}"` : <span className="text-slate-300">No remarks</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;