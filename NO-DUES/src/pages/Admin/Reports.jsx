import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('cleared_students');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for report types based on your system context
  const reportTypes = [
    { 
      id: 'cleared_students', 
      name: 'Cleared Students Report', 
      desc: 'List of students who have obtained No-Dues from all departments.',
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-100'
    },
    { 
      id: 'pending_dues', 
      name: 'Pending Dues Summary', 
      desc: 'Breakdown of outstanding dues by Department and School.',
      icon: Clock,
      color: 'text-orange-600 bg-orange-100'
    },
    { 
      id: 'user_activity', 
      name: 'User Activity Log', 
      desc: 'Detailed audit trail of admin and staff actions within the system.',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    }
  ];

  // Mock history of recently generated reports
  const recentDownloads = [
    { id: 1, name: 'Cleared_Students_Jan2025.pdf', date: 'Today, 10:30 AM', size: '1.2 MB' },
    { id: 2, name: 'Financial_Summary_Q4.xlsx', date: 'Yesterday, 4:15 PM', size: '850 KB' },
    { id: 3, name: 'Pending_Apps_SOE.csv', date: 'Jan 10, 2025', size: '120 KB' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call to /api/admin/reports/export-cleared
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Report "${selectedReport}" generated in ${format.toUpperCase()} format!`);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate detailed insights and export data for administrative records.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column: Report Generator Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. Report Type Selection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">1. Select Report Type</h3>
            </div>
            <div className="p-4 grid gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedReport === type.id;
                return (
                  <div 
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={`
                      relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' 
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                        {type.name}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{type.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Configuration & Export */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">2. Configure & Export</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    Export Format
                  </label>
                  <div className="flex gap-3">
                    {['pdf', 'csv', 'excel'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`
                          flex-1 py-2 px-3 rounded-lg text-sm font-medium border uppercase transition-all
                          ${format === fmt 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }
                        `}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`
                    w-full py-3 rounded-lg flex items-center justify-center gap-2 text-white font-medium shadow-sm transition-all
                    ${isGenerating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}
                  `}
                >
                  {isGenerating ? (
                    <>Generating Report...</>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download Report
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Recent History */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Recent Downloads</h3>
              <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {recentDownloads.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                      {item.name.endsWith('pdf') ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{item.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{item.size}</span>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-blue-600 p-1">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Need a custom report?</h4>
                <p className="text-xs text-blue-600 mb-3">
                  Contact the technical team to request specific data points or new report templates.
                </p>
                <button className="text-xs font-medium bg-white text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;