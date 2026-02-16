import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import {
  Check, Clock, XCircle, Lock, Minus, Zap, RefreshCw, 
  History, Building2, ShieldCheck, Library, Home, 
  Trophy, FlaskConical, Briefcase
} from "lucide-react";

/* -------------------- CONFIG & STYLING -------------------- */

const STATUS = {
  LOCKED: "LOCKED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SKIPPED: "SKIPPED"
};

const STATUS_CONFIG = {
  LOCKED: { 
    icon: Lock, 
    label: "Locked", 
    classes: "bg-slate-50 border-slate-200 text-slate-300", 
    lineColor: "#e2e8f0",
  },
  PENDING: { 
    icon: Clock, 
    label: "Processing", 
    classes: "bg-white border-blue-500 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.15)]", 
    lineColor: "#cbd5e1",
    glow: "animate-pulse"
  },
  APPROVED: { 
    icon: Check, 
    label: "Cleared", 
    classes: "bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent text-white shadow-lg shadow-emerald-100", 
    lineColor: "#10b981",
  },
  REJECTED: { 
    icon: XCircle, 
    label: "Rejected", 
    classes: "bg-white border-red-500 text-red-600 shadow-sm", 
    lineColor: "#f43f5e",
  },
  SKIPPED: { 
    icon: Minus, 
    label: "Waived", 
    classes: "bg-slate-50 border-dashed border-slate-300 text-slate-400", 
    lineColor: "#94a3b8",
  }
};

const getIcon = (code, name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('library')) return Library;
  if (n.includes('hostel')) return Home;
  if (n.includes('sports')) return Trophy;
  if (n.includes('lab')) return FlaskConical;
  if (n.includes('relation') || n.includes('crc')) return Briefcase;
  if (n.includes('finance') || n.includes('account')) return ShieldCheck;
  return Building2;
};

/* -------------------- SVG HELPERS -------------------- */

const SvgDefinitions = () => (
  <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
    <defs>
      {/* markers use refX="10" so the tip of the arrow is at the path end */}
      <marker id="arrow-emerald" markerWidth="8" markerHeight="8" refX="9" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#10b981" />
      </marker>
      <marker id="arrow-slate" markerWidth="8" markerHeight="8" refX="9" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#cbd5e1" />
      </marker>
      <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="9" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#f43f5e" />
      </marker>
    </defs>
  </svg>
);

const FlowLine = ({ color, active, d }) => {
  let markerId = "arrow-slate";
  if (color === "#10b981") markerId = "arrow-emerald";
  if (color === "#f43f5e") markerId = "arrow-red";

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray="5 5"
      markerEnd={`url(#${markerId})`}
      vectorEffect="non-scaling-stroke" // Prevents stretching of the dashes
      animate={active ? { strokeDashoffset: -20 } : { strokeDashoffset: 0 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  );
};

/* -------------------- UI COMPONENTS -------------------- */

const Node = ({ status, label, meta, icon: Icon }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.LOCKED;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      className="relative flex flex-col items-center group z-20"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 5 }} 
            className="absolute bottom-full mb-4 w-56 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 pointer-events-none border border-white/10"
          >
            <div className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-2 border-b border-white/5 pb-1">{label}</div>
            <div className="text-[10px] text-slate-300 leading-relaxed italic">
                {meta?.comments ? `"${meta.comments}"` : "Waiting for official review..."}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative ${config.glow}`}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 flex items-center justify-center z-10 transition-all duration-500 ${config.classes}`}
        >
          <Icon size={24} strokeWidth={1.5} className="md:w-8 md:h-8" />
        </motion.div>
        {status === STATUS.APPROVED && (
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
            <Check size={10} strokeWidth={4} />
          </div>
        )}
      </div>

      <div className="mt-3 text-center max-w-[120px]">
        <p className="text-[10px] md:text-xs font-black text-slate-800 tracking-tight uppercase leading-tight">{label}</p>
        <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold tracking-tighter uppercase ${status === STATUS.APPROVED ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          {config.label}
        </div>
      </div>
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */

const TrackStatus = () => {
  const { token } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [workflow, setWorkflow] = useState({ top: [], parallel: [], bottom: [] });

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${(import.meta.env.VITE_API_BASE || '').replace(/\/+$/g, '')}/api/applications/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);

      const mapStatus = (s) => {
        const val = (s || '').toLowerCase();
        if (['approved', 'completed', 'done', 'cleared'].includes(val)) return STATUS.APPROVED;
        if (['rejected', 'denied'].includes(val)) return STATUS.REJECTED;
        if (['skipped', 'na'].includes(val)) return STATUS.SKIPPED;
        return val === 'pending' || val === 'processing' ? STATUS.PENDING : STATUS.LOCKED;
      };

      const top = [], parallel = [], bottom = [];
      
      json.stages.sort((a, b) => a.sequence_order - b.sequence_order).forEach(s => {
        let finalLabel = s.display_name;
        if (finalLabel.toLowerCase() === 'staff') finalLabel = 'School Office';

        const stageObj = {
          id: s.id, 
          label: finalLabel, 
          status: mapStatus(s.status),
          icon: getIcon(s.verifier_role, finalLabel),
          meta: { comments: s.comments }
        };

        if (s.sequence_order < 4) top.push(stageObj);
        else if (s.sequence_order === 4) parallel.push(stageObj);
        else bottom.push(stageObj);
      });

      setWorkflow({ top, parallel, bottom });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return (
    <div className="bg-[#f8fafc] lg:mt-[-60px] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col mx-auto w-full max-w-6xl mb-20">
      <SvgDefinitions />
      
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-slate-100 flex justify-between items-center relative z-30">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Track Clearance</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Application ID: {data?.application?.display_id || '...'}</p>
          </div>
        </div>
        <button onClick={fetchStatus} className="p-2 md:px-4 md:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs hover:bg-white hover:text-indigo-600 transition-all shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline ml-2">{loading ? 'Updating...' : 'Refresh Status'}</span>
        </button>
      </div>

      <div className="p-6 md:p-12 relative bg-white min-h-[700px] flex flex-col items-center overflow-x-hidden">
        {/* Background Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

        <div className="w-full max-w-4xl flex flex-col items-center relative z-10">
          
          {/* Top Section (Sequential) */}
          <div className="w-full flex flex-col items-center">
            {workflow.top.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <Node {...stage} />
                <div className="h-16 w-1 flex justify-center py-2 relative">
                   <svg className="absolute top-0 h-full w-4 overflow-visible">
                      <FlowLine 
                        color={STATUS_CONFIG[stage.status].lineColor} 
                        active={stage.status === STATUS.APPROVED} 
                        d="M 2 0 L 2 60" // Direct vertical line
                      />
                   </svg>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Branching SVG (From School Dean to Parallel) */}
          <div className="w-full h-24 md:h-32 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {workflow.parallel.map((_, i) => {
                const lastTop = workflow.top[workflow.top.length - 1];
                const step = 100 / (workflow.parallel.length + 1);
                const targetX = step * (i + 1);
                return (
                  <FlowLine 
                    key={i} 
                    color={STATUS_CONFIG[lastTop?.status || 'LOCKED'].lineColor} 
                    active={lastTop?.status === STATUS.APPROVED} 
                    d={`M 50 0 C 50 50, ${targetX} 50, ${targetX} 95`} 
                  />
                );
              })}
            </svg>
          </div>

          {/* Parallel Row */}
          <div className="flex w-full justify-between items-start gap-2 md:gap-4 mb-6 relative">
            {workflow.parallel.map((stage) => (
              <div key={stage.id} className="flex-1 min-w-0">
                <Node {...stage} />
              </div>
            ))}
          </div>

          {/* Merge SVG (From Parallel to Bottom) */}
          <div className="w-full h-24 md:h-32 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {workflow.parallel.map((stage, i) => {
                const step = 100 / (workflow.parallel.length + 1);
                const sourceX = step * (i + 1);
                return (
                  <FlowLine 
                    key={i} 
                    color={STATUS_CONFIG[stage.status].lineColor} 
                    active={stage.status === STATUS.APPROVED} 
                    d={`M ${sourceX} 5 C ${sourceX} 50, 50 50, 50 100`} 
                  />
                );
              })}
            </svg>
          </div>

          {/* Bottom Section (Sequential) */}
          <div className="w-full flex flex-col items-center">
            {workflow.bottom.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <Node {...stage} />
                {idx < workflow.bottom.length - 1 && (
                  <div className="h-16 w-1 flex justify-center py-2 relative">
                    <svg className="absolute top-0 h-full w-4 overflow-visible">
                      <FlowLine 
                        color={STATUS_CONFIG[stage.status].lineColor} 
                        active={stage.status === STATUS.APPROVED} 
                        d="M 2 0 L 2 60"
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 px-6 py-4 flex flex-wrap justify-between items-center text-white/50">
        <div className="flex items-center gap-3 text-[10px] md:text-xs">
          <History size={14} className="text-indigo-400" />
          <span className="font-bold tracking-widest uppercase">Last Sync:</span>
          <span className="text-white">
            {data?.application?.updated_at ? new Date(data.application.updated_at).toLocaleString('en-IN') : 'Just now'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
          <ShieldCheck size={14} className="text-emerald-400" /> Secure GBU Portal
        </div>
      </div>
    </div>
  );
};

export default TrackStatus;