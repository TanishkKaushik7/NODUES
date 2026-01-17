import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import {
  Check,
  Clock,
  XCircle,
  Lock,
  Minus,
  Zap,
  RefreshCw,
  Calendar,
  User,
  AlertCircle,
  History
} from "lucide-react";

/* -------------------- CONFIG -------------------- */

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
    classes: "bg-slate-100 border-slate-200 text-slate-300",
    lineColor: "#e2e8f0"
  },
  PENDING: {
    icon: Clock,
    label: "Processing",
    classes: "bg-white border-blue-400 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    lineColor: "#e2e8f0"
  },
  APPROVED: {
    icon: Check,
    label: "Approved",
    classes: "bg-gradient-to-br from-emerald-400 to-green-500 border-transparent text-white shadow-md shadow-green-200",
    lineColor: "#10b981"
  },
  REJECTED: {
    icon: XCircle,
    label: "Rejected",
    classes: "bg-white border-red-400 text-red-500 shadow-sm",
    lineColor: "#ef4444"
  },
  SKIPPED: {
    icon: Minus,
    label: "Skipped",
    classes: "bg-slate-50 border-dashed border-slate-300 text-slate-400",
    lineColor: "#94a3b8"
  }
};

/* -------------------- SVG & PATH HELPERS -------------------- */

const generatePath = (startX, startY, endX, endY, bendY) => {
  const radius = 5; 
  if (startX === endX) return `M ${startX} ${startY} L ${endX} ${endY}`;
  const isLeft = endX < startX;
  const dir = isLeft ? -1 : 1;
  return `
    M ${startX} ${startY}
    L ${startX} ${bendY - radius}
    Q ${startX} ${bendY} ${startX + (dir * radius)} ${bendY}
    L ${endX - (dir * radius)} ${bendY}
    Q ${endX} ${bendY} ${endX} ${bendY + radius}
    L ${endX} ${endY}
  `;
};

const generateMergePath = (startX, startY, endX, endY, bendY) => {
  const radius = 10;
  if (Math.abs(startX - endX) < 1) return `M ${startX} ${startY} L ${endX} ${endY}`;
  const dir = endX > startX ? 1 : -1; 
  return `
    M ${startX} ${startY}
    L ${startX} ${bendY - radius} 
    Q ${startX} ${bendY} ${startX + (dir * radius)} ${bendY}
    L ${endX - (dir * radius)} ${bendY}
    Q ${endX} ${bendY} ${endX} ${bendY + radius}
    L ${endX} ${endY}
  `;
};

const SvgDefinitions = () => (
  <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
    <defs>
      <marker id="arrow-emerald" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L0,4 L4,2 z" fill="#10b981" />
      </marker>
      <marker id="arrow-slate" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L0,4 L4,2 z" fill="#e2e8f0" />
      </marker>
      <marker id="arrow-red" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L0,4 L4,2 z" fill="#ef4444" />
      </marker>
      <marker id="arrow-dark-slate" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
        <path d="M0,0 L0,4 L4,2 z" fill="#94a3b8" />
      </marker>
    </defs>
  </svg>
);

const getLineColor = (status) => {
  if (status === STATUS.APPROVED) return STATUS_CONFIG.APPROVED.lineColor;
  if (status === STATUS.SKIPPED) return STATUS_CONFIG.SKIPPED.lineColor;
  return STATUS_CONFIG.LOCKED.lineColor;
};

/* -------------------- FLOW COMPONENTS -------------------- */

const SplitterFlow = ({ sourceStatus }) => {
  const targets = [10, 30, 50, 70, 90];
  const color = getLineColor(sourceStatus);
  const active = [STATUS.APPROVED, STATUS.SKIPPED].includes(sourceStatus);

  return (
    <div className="w-full h-8 md:h-16 relative">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {targets.map((targetX, i) => (
          <motion.path
            key={i}
            d={generatePath(50, 0, targetX, 100, 40)}
            fill="none"
            stroke={color}
            strokeDasharray="3 3"
            markerEnd={
               sourceStatus === STATUS.APPROVED ? "url(#arrow-emerald)" :
               sourceStatus === STATUS.SKIPPED ? "url(#arrow-dark-slate)" :
               "url(#arrow-slate)"
            }
            animate={active ? { strokeDashoffset: -24 } : { strokeDashoffset: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: "1.5px" }} 
          />
        ))}
      </svg>
    </div>
  );
};

const MergerFlow = ({ statuses, parallelStages }) => {
  const sources = [10, 30, 50, 70, 90]; 
  const targetX = 50; 
  const bendY = 50;

  return (
    <div className="w-full h-8 md:h-16 relative">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {sources.map((sourceX, i) => {
            const stageKey = parallelStages[i];
            const status = statuses[stageKey];
            const color = getLineColor(status);
            const active = [STATUS.APPROVED, STATUS.SKIPPED].includes(status);
            
            return (
              <motion.path
                key={i}
                d={generateMergePath(sourceX, 0, targetX, 100, bendY)}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                markerEnd={
                   status === STATUS.APPROVED ? "url(#arrow-emerald)" :
                   status === STATUS.SKIPPED ? "url(#arrow-dark-slate)" :
                   "url(#arrow-slate)"
                }
                animate={active ? { strokeDashoffset: -24 } : { strokeDashoffset: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                vectorEffect="non-scaling-stroke"
              />
            )
        })}
      </svg>
    </div>
  );
};

const VerticalFlow = ({ status }) => {
  const color = getLineColor(status);
  const active = [STATUS.APPROVED, STATUS.SKIPPED].includes(status);

  return (
    <div className="w-full h-full flex justify-center relative overflow-visible">
      <svg className="h-full w-4 md:w-6 overflow-visible">
        <motion.line 
          x1="50%" y1="0" x2="50%" y2="100%"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          markerEnd={
             status === STATUS.APPROVED ? "url(#arrow-emerald)" :
             status === STATUS.SKIPPED ? "url(#arrow-dark-slate)" :
             "url(#arrow-slate)"
          }
          animate={active ? { strokeDashoffset: -24 } : { strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

/* -------------------- NODE COMPONENT -------------------- */

const Node = ({ status, label, id, meta }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.LOCKED;
  const { icon: Icon, label: statusLabel, classes } = config;
  
  const [isHovered, setIsHovered] = useState(false);
  const displayMeta = meta || { date: null, comments: "" };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center cursor-pointer group z-20"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full mb-3 w-40 md:w-48 bg-slate-800 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none"
          >
            <div className="text-[10px] md:text-xs font-semibold mb-1 border-b border-slate-600 pb-1">{label} Details</div>
            <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-slate-300 mb-1">
              <Calendar size={10} /> 
              <span className="truncate">
                {displayMeta.date 
                  ? new Date(displayMeta.date).toLocaleDateString() 
                  : (status === STATUS.APPROVED ? 'Approved' 
                      : status === STATUS.REJECTED ? 'Rejected' 
                      : status === STATUS.SKIPPED ? 'N/A'
                      : 'Pending')
                }
              </span>
            </div>
            <div className="flex items-start gap-2 text-[9px] md:text-[10px] text-slate-300 mt-1">
              <User size={10} className="mt-0.5 flex-shrink-0" /> 
              <span className="italic leading-tight">
                {displayMeta.comments 
                  ? displayMeta.comments 
                  : (status === STATUS.APPROVED ? 'Verified via Portal' 
                      : status === STATUS.REJECTED ? 'Request denied'
                      : status === STATUS.SKIPPED ? 'Waived (Non-Hosteller)'
                      : 'Waiting for details...')
                }
              </span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${classes}`}
      >
        <Icon size={18} className="md:w-6 md:h-6" />
      </motion.div>

      <div className="mt-2 text-center bg-white/90 backdrop-blur-sm px-1 rounded-lg">
        <p className="text-[9px] md:text-xs font-bold text-slate-700 leading-tight">{label}</p>
        <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
          {statusLabel}
        </p>
      </div>
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */

const TrackStatus = () => {
  const { student: user, token } = useStudentAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastActionDate, setLastActionDate] = useState(null);

  const [statuses, setStatuses] = useState({
    school: STATUS.LOCKED, lib: STATUS.LOCKED, hostel: STATUS.LOCKED,
    sports: STATUS.LOCKED, labs: STATUS.LOCKED, crc: STATUS.LOCKED,
    accounts: STATUS.LOCKED
  });

  const [metaData, setMetaData] = useState({});
  const parallelStages = ['lib', 'hostel', 'sports', 'labs', 'crc'];

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const url = API_BASE ? `${API_BASE}/api/applications/status` : `/api/applications/status`;
      const authToken = token || user?.access_token || localStorage.getItem('studentToken');
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();

      if (data.application && data.application.updated_at) setLastActionDate(data.application.updated_at);

      const newStatuses = {
        school: STATUS.LOCKED, lib: STATUS.LOCKED, hostel: STATUS.LOCKED,
        sports: STATUS.LOCKED, labs: STATUS.LOCKED, crc: STATUS.LOCKED,
        accounts: STATUS.LOCKED
      };
      const newMeta = {};

      const mapStatus = (apiStatus) => {
        const s = (apiStatus || '').toLowerCase();
        if (['approved', 'completed', 'done'].includes(s)) return STATUS.APPROVED;
        if (['rejected', 'denied'].includes(s)) return STATUS.REJECTED;
        if (['skipped', 'na'].includes(s)) return STATUS.SKIPPED;
        if (['pending', 'in_progress'].includes(s)) return STATUS.PENDING;
        return STATUS.LOCKED;
      };

      // ✅ FIX: Track if Hostel stage was found in API response
      let hostelStageFound = false;

      // 1. Map all stages directly from backend
      if (data.stages && Array.isArray(data.stages)) {
        data.stages.forEach(stage => {
          let key = null;
          switch(stage.verifier_role) {
            case 'dean': key = 'school'; break;
            case 'library': key = 'lib'; break;
            case 'hostel': 
                key = 'hostel'; 
                hostelStageFound = true; // Mark as found
                break;
            case 'sports': key = 'sports'; break;
            case 'lab': key = 'labs'; break;
            case 'crc': key = 'crc'; break;
            case 'account': key = 'accounts'; break;
            default: break;
          }
          if (key) {
            newStatuses[key] = mapStatus(stage.status);
            newMeta[key] = { 
              date: stage.updated_at, 
              comments: stage.comments || stage.remarks, 
              officer: stage.display_name 
            };
          }
        });
      }

      // ✅ FIX: Only skip hostel if the backend did NOT return a hostel stage
      // This implies the student is a Day Scholar and the backend logic skipped it.
      // If the backend sent a Hostel stage (even pending), we show it.
      if (!hostelStageFound) {
        newStatuses.hostel = STATUS.SKIPPED;
        newMeta.hostel = {
          date: null,
          comments: "Requirement waived (Non-Hosteller)",
          officer: "System"
        };
      }

      setStatuses(newStatuses);
      setMetaData(newMeta);
    } catch (err) {
      setError("Unable to load live status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  const formatLastAction = (dateString) => {
    if (!dateString) return "No recent activity";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white lg:mt-[-50px] rounded-2xl border border-slate-200 shadow-sm animate-fade-in overflow-hidden flex flex-col mx-auto w-full max-w-5xl">
      <SvgDefinitions />
      
      <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/50 gap-2">
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 border border-indigo-100 w-fit">
            <Zap size={10} className="fill-current" /> Live Workflow
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 leading-tight">Application Status</h2>
        </div>
        
        {loading ? (
          <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 animate-spin" />
        ) : (
          <button onClick={fetchStatus} className="text-slate-400 hover:text-indigo-600 transition-colors p-1">
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>

      <div className="p-4 md:p-10 relative flex-grow flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px]">
        {error && (
          <div className="absolute top-2 left-0 right-0 px-4 z-50">
            <div className="p-2 md:p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* WORKFLOW CONTAINER */}
        <div className="flex flex-col items-center relative z-10 w-full transform scale-[0.85] sm:scale-90 md:scale-100 origin-top">
          <Node id="school" label="School Dean" status={statuses.school} meta={metaData.school} />
          <div className="h-6 md:h-12 w-full"><VerticalFlow status={statuses.school} /></div>
          <SplitterFlow sourceStatus={statuses.school} />
          
          <div className="flex w-full items-start -mt-1 justify-between gap-1 sm:gap-4">
            {parallelStages.map((stage) => (
              <div key={stage} className="flex-1 flex flex-col items-center">
                <Node id={stage} label={stage === 'lib' ? 'Library' : stage.toUpperCase()} status={statuses[stage]} meta={metaData[stage]} />
                <div className="h-6 md:h-10 w-full"><VerticalFlow status={statuses[stage]} /></div>
              </div>
            ))}
          </div>

          <div className="-mt-1 w-full"><MergerFlow statuses={statuses} parallelStages={parallelStages} /></div>
          <div className="-mt-1"><Node id="accounts" label="Accounts" status={statuses.accounts} meta={metaData.accounts} /></div>
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between text-[10px] md:text-xs text-slate-500">
        <div className="flex items-center gap-2 overflow-hidden">
          <History size={12} className="text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-600 flex-shrink-0">Updated:</span>
          <span className="truncate">{loading ? "Syncing..." : formatLastAction(lastActionDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackStatus;