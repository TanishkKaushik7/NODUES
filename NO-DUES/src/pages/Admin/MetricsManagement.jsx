import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, Server, Database, Mail, Clock, RefreshCw, 
  Trash2, ShieldAlert, BarChart3, Users, CheckCircle, 
  XCircle, Loader2, AlertCircle, HardDrive
} from 'lucide-react';

const MetricsManagement = () => {
  const { authFetch } = useAuth();
  
  // Data States
  const [health, setHealth] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [redisStats, setRedisStats] = useState(null);
  const [trafficStats, setTrafficStats] = useState(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all metrics concurrently for speed
      const [healthRes, dashRes, redisRes, trafficRes] = await Promise.all([
        authFetch('/api/metrics/health'),
        authFetch('/api/metrics/dashboard-stats'),
        authFetch('/api/metrics/redis-stats'),
        authFetch('/api/metrics/traffic-stats')
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (dashRes.ok) setDashStats(await dashRes.json());
      if (redisRes.ok) setRedisStats(await redisRes.json());
      if (trafficRes.ok) setTrafficStats(await trafficRes.json());
      
    } catch (err) {
      console.error("Failed to fetch metrics", err);
      setError("Failed to load some metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchAllMetrics();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchAllMetrics]);

  const handleClearCache = async (scope) => {
    const scopeNames = {
      'rate_limits': 'Rate Limits',
      'traffic': 'Traffic Stats',
      'all': 'Global Cache'
    };
    
    if (!window.confirm(`Are you sure you want to clear ${scopeNames[scope]}?`)) return;

    setClearingCache(true);
    try {
      const res = await authFetch(`/api/metrics/clear-cache?scope=${scope}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        alert(`Success: ${data.message}`);
        fetchAllMetrics(); // Refresh data to show empty cache
      } else {
        alert(data.detail || "Failed to clear cache");
      }
    } catch (err) {
      alert("Network error occurred while clearing cache");
    } finally {
      setClearingCache(false);
    }
  };

  // Utility to format seconds into readable uptime
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
  };

  if (loading && !health) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading System Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">System Metrics</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Live Monitoring & Cache Control
            </p>
          </div>
        </div>

        <button 
          onClick={fetchAllMetrics}
          disabled={loading}
          className="h-12 px-6 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm font-bold">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: System Health & Cache */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* SYSTEM HEALTH CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
          >
            <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Server className="h-4 w-4 text-blue-500" /> Server Health
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Database className="h-4 w-4 text-slate-400" /> Database
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${health?.database === 'Connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {health?.database || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" /> SMTP Server
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-widest ${health?.smtp_server === 'Connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {health?.smtp_server || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" /> Uptime
                </div>
                <span className="text-sm font-black text-slate-800">
                  {formatUptime(health?.uptime_seconds)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* REDIS & CACHE MANAGEMENT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
          >
            <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <HardDrive className="h-4 w-4 text-indigo-500" /> Redis Cache Store
            </h3>

            {redisStats?.status === 'Online' ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Memory Used</p>
                    <p className="text-xl font-black text-indigo-900">{redisStats.metrics.memory.used}</p>
                  </div>
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Keys</p>
                    <p className="text-xl font-black text-indigo-900">{redisStats.metrics.db.total_keys}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={() => handleClearCache('rate_limits')} disabled={clearingCache} className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-between">
                    <span>Clear Rate Limits</span> <ShieldAlert className="h-4 w-4 text-slate-400" />
                  </button>
                  <button onClick={() => handleClearCache('traffic')} disabled={clearingCache} className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-between">
                    <span>Clear Traffic Stats</span> <BarChart3 className="h-4 w-4 text-slate-400" />
                  </button>
                  <button onClick={() => handleClearCache('all')} disabled={clearingCache} className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-between">
                    <span>Flush All Cache</span> <Trash2 className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-2xl text-slate-500 text-sm font-bold">
                Redis is Disabled or Offline
              </div>
            )}
          </motion.div>
        </div>

        {/* COLUMN 2 & 3: App Stats & Traffic */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* APPLICATION STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Apps', value: dashStats?.metrics?.total_applications || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Completed', value: dashStats?.metrics?.completed || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending', value: dashStats?.metrics?.pending || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Rejected', value: dashStats?.metrics?.rejected || 0, color: 'text-rose-600', bg: 'bg-rose-50' },
            ].map((stat, idx) => (
              <motion.div 
                key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="bg-white p-5 rounded-[1.5rem] border border-slate-200/60 shadow-sm flex flex-col items-center justify-center text-center"
              >
                <div className={`h-10 w-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* BOTTLENECKS & TRAFFIC (Split row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* TOP BOTTLENECKS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
            >
              <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Pending Bottlenecks
              </h3>
              
              <div className="space-y-4">
                {dashStats?.top_bottlenecks?.length > 0 ? (
                  dashStats.top_bottlenecks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-600 truncate pr-4">{b.department}</span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{b.pending_count} pending</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 font-medium">No pending bottlenecks found.</p>
                )}
              </div>
            </motion.div>

            {/* TRAFFIC STATS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
            >
              <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Activity className="h-4 w-4 text-emerald-500" /> Top API Traffic
              </h3>
              
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {trafficStats?.data?.length > 0 ? (
                  trafficStats.data.slice(0, 10).map((t, i) => {
                    // Calculate width percentage relative to the highest hit count
                    const maxHits = trafficStats.data[0].hits;
                    const percent = Math.max(10, Math.round((t.hits / maxHits) * 100));
                    
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-black  tracking-wider">
                          <span className="text-slate-500 truncate pr-2">
                            <span className={t.method === 'GET' ? 'text-blue-500' : 'text-emerald-500'}>{t.method}</span> {t.path}
                          </span>
                          <span className="text-slate-700">{t.hits} hits</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-slate-800 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 font-medium">No traffic data recorded yet.</p>
                )}
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MetricsManagement;