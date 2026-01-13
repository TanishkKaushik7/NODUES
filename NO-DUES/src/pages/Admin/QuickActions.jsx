import React from 'react';
import { UserPlus, Building2, GraduationCap, FileDown, Plus } from 'lucide-react';

const QuickActions = ({ onRegisterUser, onCreateSchool, onCreateDept, onExport }) => {
  
  const actions = [
    {
      label: "Register User",
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      handler: onRegisterUser || (() => console.log("Register User"))
    },
    {
      label: "Create School",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      handler: onCreateSchool || (() => console.log("Create School"))
    },
    {
      label: "Create Dept",
      icon: GraduationCap,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      handler: onCreateDept || (() => console.log("Create Dept"))
    },
    {
      label: "Export Report",
      icon: FileDown,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      handler: onExport || (() => console.log("Export Report"))
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header aligned with the table style */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
      </div>

      {/* Grid with specific heights to prevent stretching */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-sm">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.handler}
            className="group flex flex-col items-center justify-center p-4 h-28 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.97]"
          >
            <div className={`p-3 rounded-xl ${action.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-xs font-bold text-slate-700 tracking-tight">
              {action.label}
            </span>
            
            {/* Subtle plus indicator that appears on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Plus className="h-3 w-3 text-slate-300" />
            </div>
          </button>
        ))}
      </div>
      
      {/* Optional footer info to keep height consistent if needed */}
      <div className="mt-auto pt-4">
        <p className="text-[10px] text-slate-400 font-medium">
          Note: Some actions require Super Admin privileges.
        </p>
      </div>
    </div>
  );
};

export default QuickActions;