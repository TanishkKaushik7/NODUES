import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RecentLogsWidget = ({ onNavigate }) => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/admin/audit-logs?limit=5');
        if (response.ok) {
          const data = await response.json();
          setLogs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching recent logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentLogs();
  }, [authFetch]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tightened Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-blue-600" />
          Recent Activity
        </h3>
        <time className="text-[10px] font-bold text-slate-400 uppercase">Live Feed</time>
      </div>

      {/* Compact Activity Timeline */}
      <div className="relative flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
            <p className="text-xs">Syncing...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-0">
            {logs.map((log, index) => (
              <div key={log.id} className="group relative flex gap-3 pb-3 last:pb-0">
                {/* Vertical Connector Line */}
                {index !== logs.length - 1 && (
                  <span className="absolute left-[13px] top-7 w-px h-[calc(100%-8px)] bg-slate-100" aria-hidden="true" />
                )}

                {/* Status Icon - Smaller */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                    log.action === 'STAGE_APPROVED' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    {log.action === 'STAGE_APPROVED' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                    )}
                  </div>
                </div>

                {/* Log Content - Reduced Padding */}
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {log.actor_name || 'System'}
                      <span className="font-normal text-slate-500 mx-1">
                        {log.action === 'STAGE_APPROVED' ? 'approved' : 'rejected'}
                      </span>
                      <span className="text-blue-600 font-mono font-bold">
                        {log.details?.student_roll || 'N/A'}
                      </span>
                    </p>
                    <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap ml-2">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Compact Remarks Box */}
                  {log.remarks && (
                    <div className="mt-1 p-1.5 bg-slate-50 rounded border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-1 italic">
                        "{log.remarks}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">No activity</div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="mt-4 pt-3 border-t border-slate-50">
        <button 
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all group"
        >
          Full Audit Trail
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RecentLogsWidget;