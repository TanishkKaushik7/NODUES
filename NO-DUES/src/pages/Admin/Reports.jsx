import React, { useState } from 'react';
import { 
  Download, Calendar, FileSpreadsheet, 
  Filter, CheckCircle2, Loader2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Reports = () => {
  const { authFetch } = useAuth();
  const [selectedReport, setSelectedReport] = useState('cleared_students');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [format, setFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Simplified Report Types - Focused only on Cleared Students
  const reportTypes = [
    { 
      id: 'cleared_students', 
      name: 'Cleared Students Report', 
      desc: 'Live list of students who have completed all university clearance phases and are eligible for graduation.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50'
    }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const endpoint = selectedReport === 'cleared_students' 
        ? '/api/admin/reports/export-cleared' 
        : null;

      if (!endpoint) {
        throw new Error("Report template selection error.");
      }

      const response = await authFetch(endpoint);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to generate report");
      }

      const blob = await response.blob();
      
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `GBU_Cleared_Students_${Date.now()}.${format}`;
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        fileName = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 py-4">
      
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Export student clearance data for university archives and graduation formalities.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Report Selection */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">1. Select Report Type</h3>
            {error && <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3"/> {error}</span>}
          </div>
          <div className="p-6">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedReport === type.id;
              return (
                <div 
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`
                    relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300
                    ${isSelected 
                      ? 'border-slate-900 bg-slate-50 shadow-md ring-4 ring-slate-100' 
                      : 'border-slate-100 hover:border-slate-200'
                    }
                  `}
                >
                  <div className={`p-3 rounded-xl ${type.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{type.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{type.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Configuration & Generate */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">2. Configure & Download</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Date Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Activity Range (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <span className="text-slate-300 font-bold">to</span>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>

              {/* Format Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Output Format
                </label>
                <div className="flex gap-2">
                  {['csv'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`
                        flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all
                        ${format === fmt 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                        }
                      `}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98]
                ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-emerald-600 hover:shadow-emerald-100'}
              `}
            >
              {isGenerating ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Preparing File...</>
              ) : (
                <><Download className="h-5 w-5" /> Generate Report</>
              )}
            </button>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-3 w-3" />
                Data is pulled directly from live clearance records
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;