import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import {
  Check, Clock, XCircle, Lock, RefreshCw, 
  Building2, ShieldCheck, Library, Home, 
  Trophy, FlaskConical, Briefcase, ChevronDown,
  History
} from "lucide-react";

/* -------------------- CONFIG -------------------- */

const STATUS = {
  LOCKED: "LOCKED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};

const STATUS_CONFIG = {
  LOCKED: { icon: Lock, label: "Locked", bgColor: "bg-slate-50", borderColor: "border-slate-200", textColor: "text-slate-400" },
  PENDING: { icon: Clock, label: "In Progress", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-500" },
  APPROVED: { icon: Check, label: "Cleared", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-600" },
  REJECTED: { icon: XCircle, label: "Action Req.", bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-500" }
};

const getIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('library')) return Library;
  if (n.includes('hostel')) return Home;
  if (n.includes('sports')) return Trophy;
  if (n.includes('lab')) return FlaskConical;
  if (n.includes('relation') || n.includes('crc')) return Briefcase;
  if (n.includes('finance') || n.includes('account')) return ShieldCheck;
  return Building2;
};

/**
 * Robust IST Formatter
 * Fixes the 5h 30m offset by ensuring input is treated as UTC
 */
const formatDateIST = (dateString) => {
  if (!dateString) return null;
  try {
    // 1. Normalize the string (Replace spaces with T for ISO compliance)
    // 2. Append 'Z' if no timezone offset exists to force UTC interpretation
    let normalizedString = dateString.replace(' ', 'T');
    if (!normalizedString.endsWith('Z') && !normalizedString.includes('+')) {
      normalizedString += 'Z';
    }

    const date = new Date(normalizedString);
    
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

/* -------------------- UI COMPONENTS -------------------- */

const Node = ({ status, label, icon: Icon, isSmall = false, meta, position = 'right' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.LOCKED;
  const [isHovered, setIsHovered] = useState(false);

  const showTooltip = status !== STATUS.LOCKED;
  const displayComment = meta?.comments || "Verification in progress. Awaiting remarks.";

  const tooltipPositionClass = position === 'right' ? "left-full ml-5" : "right-full mr-5";
  const arrowPositionClass = position === 'right' ? "right-full border-r-slate-900" : "left-full border-l-slate-900";

  return (
    <div 
      className="relative flex flex-col items-center"
      style={{ zIndex: isHovered ? 100 : 10 }}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && showTooltip && (
          <motion.div 
            initial={{ opacity: 0, x: position === 'right' ? -10 : 10, scale: 0.95 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            exit={{ opacity: 0, x: position === 'right' ? -5 : 5, scale: 0.95 }}
            className={`absolute top-0 w-64 p-4 bg-slate-900 border border-white/20 shadow-2xl rounded-2xl z-[150] pointer-events-none ${tooltipPositionClass}`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Remarks</span>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${config.bgColor} ${config.textColor}`}>
                  {config.label}
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-white font-medium italic">
                "{displayComment}"
              </p>
            </div>
            <div className={`absolute top-6 -translate-y-1/2 border-[8px] border-transparent ${arrowPositionClass}`} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`
        ${isSmall ? 'w-14 h-14' : 'w-16 h-16 md:w-20 md:h-20'} 
        rounded-2xl border-2 flex items-center justify-center shadow-sm bg-white
        ${config.borderColor} transition-all duration-300
        ${isHovered ? 'shadow-md ring-4 ring-slate-100' : ''}
      `}>
        <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${config.bgColor}`}>
           <Icon size={isSmall ? 20 : 24} className={config.textColor} />
        </div>
        {status === STATUS.APPROVED && (
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
            <Check size={10} strokeWidth={4} />
          </div>
        )}
      </div>
      <div className="mt-3 text-center w-24 md:w-32">
        <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase leading-tight tracking-wide">{label}</p>
        <p className={`text-[9px] font-bold mt-1 ${config.textColor}`}>{config.label}</p>
      </div>
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */

const TrackStatus = () => {
  const { token } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState({ top: [], parallel: [], bottom: [] });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${(import.meta.env.VITE_API_BASE || '').replace(/\/+$/g, '')}/api/applications/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      setLastUpdated(json.application.updated_at);

      const mapStatus = (s) => {
        const val = (s || '').toLowerCase();
        if (['approved', 'completed', 'cleared'].includes(val)) return STATUS.APPROVED;
        if (['rejected', 'denied'].includes(val)) return STATUS.REJECTED;
        return val === 'pending' || val === 'processing' || val === 'in progress' ? STATUS.PENDING : STATUS.LOCKED;
      };

      const stages = [...json.stages].sort((a, b) => a.sequence_order - b.sequence_order);
      const top = [], parallel = [], bottom = [];

      stages.forEach(s => {
        const stageObj = { 
          id: s.id, 
          label: s.display_name === 'Staff' ? 'Office' : s.display_name, 
          status: mapStatus(s.status), 
          icon: getIcon(s.display_name),
          meta: { comments: s.comments } 
        };
        if (s.sequence_order < 4) top.push(stageObj);
        else if (s.sequence_order === 4) parallel.push(stageObj);
        else bottom.push(stageObj);
      });
      setWorkflow({ top, parallel, bottom });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const lastTopActive = workflow.top[workflow.top.length - 1]?.status === STATUS.APPROVED;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Application Status</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Clearance Workflow</p>
          </div>
          <button onClick={fetchStatus} className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl transition-all active:scale-95 group">
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500 text-slate-500`} />
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-14 overflow-x-auto overflow-y-visible">
            <div className="min-w-[800px] flex flex-col items-center relative py-10">
              
              {/* 1. TOP SECTION */}
              {workflow.top.map((stage) => (
                <React.Fragment key={stage.id}>
                  <Node {...stage} position="right" />
                  <div className={`w-0.5 h-10 ${stage.status === STATUS.APPROVED ? 'bg-emerald-500' : 'bg-slate-200'} transition-colors duration-500 relative`}>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                          <ChevronDown size={14} className={stage.status === STATUS.APPROVED ? 'text-emerald-500' : 'text-slate-300'} strokeWidth={3} />
                      </div>
                  </div>
                </React.Fragment>
              ))}

              {/* 2. PARALLEL SECTION */}
              {workflow.parallel.length > 0 && (
                <div className="w-full relative">
                  <div className="flex w-full">
                    {workflow.parallel.map((stage, idx) => {
                      const isLeftHalf = idx < (workflow.parallel.length / 2);
                      return (
                        <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                          <div className={`absolute top-0 h-0.5 w-full ${lastTopActive ? 'bg-emerald-500' : 'bg-slate-200'} 
                            ${idx === 0 ? 'left-1/2 w-1/2' : ''} 
                            ${idx === workflow.parallel.length - 1 ? 'right-1/2 w-1/2' : ''}`} 
                          />
                          <div className={`w-0.5 h-6 ${lastTopActive ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          <Node {...stage} isSmall position={isLeftHalf ? 'right' : 'left'} />
                          <div className={`w-0.5 h-6 ${stage.status === STATUS.APPROVED ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          <div className={`absolute bottom-0 h-0.5 w-full bg-slate-200
                            ${idx === 0 ? 'left-1/2 w-1/2' : ''} 
                            ${idx === workflow.parallel.length - 1 ? 'right-1/2 w-1/2' : ''}
                            ${stage.status === STATUS.APPROVED ? 'bg-emerald-500' : ''}`} 
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center">
                      <div className="w-0.5 h-10 bg-slate-200 relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                              <ChevronDown size={14} className="text-slate-300" strokeWidth={3} />
                          </div>
                      </div>
                  </div>
                </div>
              )}

              {/* 3. BOTTOM SECTION */}
              <div className="flex flex-col items-center">
                {workflow.bottom.map((stage, idx) => (
                  <React.Fragment key={stage.id}>
                    <Node {...stage} position="right" />
                    {idx < workflow.bottom.length - 1 && (
                      <div className={`w-0.5 h-10 ${stage.status === STATUS.APPROVED ? 'bg-emerald-500' : 'bg-slate-200'} relative`}>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                              <ChevronDown size={14} className={stage.status === STATUS.APPROVED ? 'text-emerald-500' : 'text-slate-300'} strokeWidth={3} />
                          </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* PAGE FOOTER - FINAL IST FIX */}
          <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                <History size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">Last System Update (IST)</p>
                <p className="text-sm font-bold text-slate-700">{formatDateIST(lastUpdated) || 'Syncing latest data...'}</p>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Live System Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackStatus;