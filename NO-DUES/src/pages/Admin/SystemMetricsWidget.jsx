import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, HardDrive, Cpu, RefreshCw, Loader2, Globe, Mail, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SystemMetricsWidget = () => {
  const { authFetch } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [authFetch]);

  const MetricBar = ({ label, value, icon: Icon, colorClass }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          {label}
        </div>
        <span className="text-slate-600">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-700 ease-in-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          System Health
        </h3>
        <button 
          onClick={fetchMetrics} 
          className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !metrics ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs font-medium text-slate-400">Fetching live metrics...</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {/* Status Badge Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Status</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <Globe className="h-3.5 w-3.5" /> {metrics?.status || 'Online'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
              <p className="text-[9px] font-bold text-blue-600 uppercase mb-1">DB Latency</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-blue-700">
                <Database className="h-3.5 w-3.5" /> {metrics?.db_latency_ms?.toFixed(1)}ms
              </div>
            </div>
          </div>

          {/* New Connection Details Row */}
          <div className="grid grid-cols-2 gap-4 px-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${metrics?.database === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-[11px] font-medium text-slate-600">Database: {metrics?.database}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${metrics?.smtp_server === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-[11px] font-medium text-slate-600">SMTP: {metrics?.smtp_server}</span>
            </div>
          </div>

          {/* Real-time Load Bars */}
          <div className="space-y-4">
            <MetricBar label="CPU Usage" value={metrics?.cpu || 0} icon={Cpu} colorClass="bg-indigo-500" />
            <MetricBar label="Memory" value={metrics?.ram || 0} icon={Server} colorClass="bg-blue-500" />
            <MetricBar label="Disk Space" value={metrics?.disk || 0} icon={HardDrive} colorClass="bg-slate-700" />
          </div>

         

          {/* Infrastructure Metadata */}
          <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase">
            <div>
              <span className="block text-slate-300 mb-0.5 text-[15px]">Uptime</span>
              <span className="text-slate-600 text-[15px]">
                {Math.floor(metrics?.uptime / 3600)}h {Math.floor((metrics?.uptime % 3600) / 60)}m
              </span>
            </div>
            <div className="text-right">
              <span className="block text-slate-300 mb-0.5 text-[9px]">Engine</span>
              <span className="text-slate-600">v{metrics?.version}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMetricsWidget;