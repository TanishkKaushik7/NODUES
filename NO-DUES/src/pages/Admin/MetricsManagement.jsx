import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, Server, Database, Mail, Clock, RefreshCw, 
  Trash2, BarChart3, Users, Loader2, AlertCircle, HardDrive, Zap
} from 'lucide-react';
import ClearCacheModal from './ClearCacheModal'; 

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScope, setActiveScope] = useState(null);

  const fetchAllMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    const interval = setInterval(fetchAllMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchAllMetrics]);

  const handleClearCache = async (scope) => {
    setActiveScope(scope);
    setClearingCache(true);
    try {
      const res = await authFetch(`/api/metrics/clear-cache?scope=${scope}`, { method: 'POST' });
      if (res.ok) {
        setIsModalOpen(false);
        fetchAllMetrics();
      }
    } catch (err) {
      alert("Network error occurred while clearing cache");
    } finally {
      setClearingCache(false);
      setActiveScope(null);
    }
  };

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
        <p className="mt-4 text-sm font-bold text-slate-400 tracking-widest uppercase">Loading System Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12 px-4 sm:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">System Metrics</h2>
            <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] mt-1">Live Monitoring & Cache Control</p>
          </div>
        </div>

        <button 
          onClick={fetchAllMetrics}
          disabled={loading}
          className="h-12 px-6 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH DATA</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm font-bold">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SERVER HEALTH & LATENCY */}
        <div className="space-y-6 lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
          >
            <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 tracking-[0.2em] uppercase">
              <Server className="h-4 w-4 text-blue-500" /> Infrastructure Health
            </h3>
            
            <div className="space-y-3">
              {/* DB CONNECTION */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Database className="h-4 w-4 text-slate-400" /> Database
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-md font-black tracking-widest uppercase ${health?.database === 'Connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {health?.database || 'Unknown'}
                </span>
              </div>

              {/* DB LATENCY */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Zap className="h-4 w-4 text-amber-500" /> DB Latency
                </div>
                <span className={`text-xs font-black ${health?.database_latency_ms > 300 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {health?.database_latency_ms ? `${health.database_latency_ms}ms` : '--'}
                </span>
              </div>

              {/* ⭐ REDIS LATENCY ⭐ */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Activity className="h-4 w-4 text-indigo-500" /> Redis Latency
                </div>
                <span className={`text-xs font-black ${health?.redis_latency_ms > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {health?.redis_latency_ms ? `${health.redis_latency_ms}ms` : '--'}
                </span>
              </div>

              {/* SMTP */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" /> SMTP Server
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-md font-black tracking-widest uppercase ${health?.smtp_server === 'Connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {health?.smtp_server || 'Offline'}
                </span>
              </div>

              {/* UPTIME */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" /> Uptime
                </div>
                <span className="text-xs font-black text-slate-800">
                  {formatUptime(health?.uptime_seconds)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* REDIS MEMORY CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
          >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 flex items-center gap-2 tracking-[0.2em] uppercase">
                    <HardDrive className="h-4 w-4 text-indigo-500" /> Redis Storage
                </h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {redisStats?.status === 'Online' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <p className="text-[9px] font-black text-indigo-400 tracking-widest mb-1 uppercase">Memory</p>
                  <p className="text-xl font-black text-indigo-900">{redisStats.metrics.memory.used}</p>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <p className="text-[9px] font-black text-indigo-400 tracking-widest mb-1 uppercase">Keys</p>
                  <p className="text-xl font-black text-indigo-900">{redisStats.metrics.db.total_keys}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-2xl text-slate-500 text-xs font-bold uppercase">
                Redis Layer Offline
              </div>
            )}
          </motion.div>
        </div>

        {/* APPLICATION STATS & TRAFFIC */}
        <div className="space-y-6 lg:col-span-2">
          {/* TOP COUNTERS */}
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
                <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                <p className="text-[9px] font-black text-slate-400 tracking-widest mt-1 uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BOTTLENECKS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
            >
              <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 tracking-[0.2em] uppercase">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Pending Bottlenecks
              </h3>
              <div className="space-y-4">
                {dashStats?.top_bottlenecks?.length > 0 ? (
                  dashStats.top_bottlenecks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-600 truncate pr-4">{b.department}</span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{b.pending_count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-bold uppercase">No bottlenecks detected</p>
                )}
              </div>
            </motion.div>

            {/* TRAFFIC DATA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/30"
            >
              <h3 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-2 tracking-[0.2em] uppercase">
                <Activity className="h-4 w-4 text-emerald-500" /> API Traffic (Top 10)
              </h3>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {trafficStats?.data?.length > 0 ? (
                  trafficStats.data.slice(0, 10).map((t, i) => {
                    const maxHits = trafficStats.data[0].hits;
                    const percent = Math.max(10, Math.round((t.hits / maxHits) * 100));
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black tracking-wider uppercase">
                          <span className="text-slate-500 truncate pr-2">
                            <span className={t.method === 'GET' ? 'text-blue-500' : 'text-emerald-500'}>{t.method}</span> {t.path}
                          </span>
                          <span className="text-slate-700">{t.hits} HITS</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                          <div className="bg-slate-800 h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 font-bold uppercase">No traffic recorded</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ClearCacheModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearCache}
        clearingScope={activeScope}
        isProcessing={clearingCache}
      />
    </div>
  );
};

export default MetricsManagement;