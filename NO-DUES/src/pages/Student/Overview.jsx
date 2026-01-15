import React, { useState } from 'react';
import { motion } from 'framer-motion';
// ✅ IMPORT THE CUSTOM API INSTANCE
import api from '../../api/axios'; 
import { 
  FiUser, FiFileText, FiCheckCircle, FiActivity, 
  FiDownload, FiArrowRight, FiShield, FiClock 
} from 'react-icons/fi';

const Overview = ({ user, formData, stepStatuses, setActive, applicationId, token }) => {
  const [downloading, setDownloading] = useState(false);

  // Calculate Progress
  const totalSteps = stepStatuses.length;
  const completedSteps = stepStatuses.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const isFullyCleared = progressPercent === 100;

  const handleDownloadCertificate = async () => {
    if (!applicationId) return;
    setDownloading(true);
    try {
      // ✅ SWITCHED TO API INSTANCE FOR SESSION PROTECTION
      // Axios handles the blob via responseType: 'blob'
      const response = await api.get(`/api/applications/${applicationId}/certificate`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GBU_Clearance_${formData.rollNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // If 401, the Axios interceptor handles the logout popup automatically
      const detail = err.response?.data?.detail || 'Certificate not ready for download yet.';
      alert(detail);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[3rem] mt-[-40px] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="relative z-10 space-y-5 max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter">
            Greetings, <span className="text-blue-500">{formData.fullName.split(' ')[0] || 'Student'}.</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-wider">
            Your clearance dashboard is active. Monitor approvals in real-time.
          </p>
        </div>

        {/* Compact Progress Card */}
        <div className="relative z-10 w-full lg:w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10"/>
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * progressPercent) / 100}
                strokeLinecap="round"
                className={`${isFullyCleared ? 'text-emerald-500' : 'text-blue-500'} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-black">{progressPercent}%</div>
          </div>
          
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
            {isFullyCleared ? (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Cleared</span>
                <button
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {downloading ? <FiClock className="animate-spin" /> : <FiDownload />}
                  Certificate
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-black text-blue-400 uppercase">In Progress</span>
            )}
          </div>
        </div>
        
        {/* Subtle Background Decoration */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard icon={FiUser} label="Enrollment ID" value={formData.enrollmentNumber} />
        <InfoCard icon={FiFileText} label="Registry Roll" value={formData.rollNumber} />
        <InfoCard icon={FiShield} label="Academic School" value={user?.school_name || "SOICT"} />
        <InfoCard 
          icon={FiCheckCircle} 
          label="Verification Status" 
          value={isFullyCleared ? "Approved" : "Pending"} 
          color={isFullyCleared ? "text-emerald-500" : "text-blue-500"}
          bgColor={isFullyCleared ? "bg-emerald-50" : "bg-blue-50"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActionCard 
          title="Modify Application" 
          desc="Update your personal or academic details for registry review." 
          icon={FiFileText} 
          onClick={() => setActive('form')}
        />
        <ActionCard 
          title="Live Track Flow" 
          desc="View detailed departmental approval logs and pending nodes." 
          icon={FiActivity} 
          onClick={() => setActive('status')}
        />
      </div>
    </div>
  );
};

/* --- Sub-Components --- */

const InfoCard = ({ icon: Icon, label, value, color = "text-slate-900", bgColor = "bg-white" }) => (
  <div className={`${bgColor} p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4`}>
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-lg font-black tracking-tight uppercase ${color}`}>{value || '—'}</p>
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 flex items-center justify-between text-left w-full"
  >
    <div className="flex gap-8 items-center">
      <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shrink-0">
        <Icon size={28} />
      </div>
      <div>
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h4>
        <p className="text-sm text-slate-400 font-medium max-w-xs">{desc}</p>
      </div>
    </div>
    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shrink-0">
      <FiArrowRight size={20} />
    </div>
  </button>
);

export default Overview;