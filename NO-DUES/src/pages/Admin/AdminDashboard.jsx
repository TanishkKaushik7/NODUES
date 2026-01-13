import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Building2, FileText, 
  ClipboardList, Search, Settings, ChevronDown, Menu 
} from 'lucide-react';

// Widgets
import DashboardStats from './DashboardStats';
import PerformanceChart from './PerformanceChart';
import RecentLogsWidget from './RecentLogsWidget';
import QuickActions from './QuickActions';
import SystemMetricsWidget from './SystemMetricsWidget';

// Full Pages
import UserManagement from './UserManagement';
import SchoolDeptManagement from './SchoolDeptManagement';
import AuditLogs from './AuditLogs';
import Reports from './Reports';

// Modals
import RegisterUserModal from './RegisterUserModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'schools', label: 'School & Dept. Management', icon: Building2 },
    { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Row: General Statistics */}
            <DashboardStats />

            {/* Middle Row: Analytics and Live Feed */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <PerformanceChart />
              </div>

              <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <RecentLogsWidget onNavigate={() => setActiveTab('audit')} />
              </div>
            </div>

            {/* Bottom Row: Admin Tools and System Health */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6 self-start">
                <QuickActions onRegisterUser={() => setIsRegisterModalOpen(true)} />
              </div>

              <div className="col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <SystemMetricsWidget />
              </div>
            </div>
          </div>
        );
      case 'users': 
        return <UserManagement />;
      case 'schools': 
        return <SchoolDeptManagement />;
      case 'audit': 
        return <AuditLogs />;
      case 'reports': 
        return <Reports />;
      default: 
        return <div className="p-8 text-center text-slate-500">Page under construction.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* ------------------- HEADER ------------------- */}
      <header className="h-16 bg-[#1e40af] text-white flex items-center justify-between px-4 shadow-md z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-white hover:bg-blue-700 rounded-md md:hidden transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold tracking-wide hidden md:block">
            GBU No Dues <span className="text-blue-300 mx-2">|</span> Super Admin Portal
          </h1>
          <h1 className="text-lg font-semibold md:hidden">Super Admin</h1>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
            <input
              type="search"
              placeholder="Search students, staff, or departments..."
              className="w-full bg-white text-slate-900 pl-10 h-10 rounded-lg border border-transparent focus:ring-2 focus:ring-blue-400 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Profile/Settings */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-white/80 hover:bg-blue-700 rounded-full transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-blue-500/50">
            <div className="h-9 w-9 rounded-full border-2 border-white/20 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
               <span className="text-xs font-bold text-white">SA</span>
            </div>
            <button className="hidden md:flex items-center text-sm font-medium hover:bg-blue-700 px-3 py-1.5 rounded transition-colors group">
              Super Admin
              <ChevronDown className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ------------------- SIDEBAR ------------------- */}
        <aside className={`
          ${isSidebarOpen ? 'w-64' : 'w-0 opacity-0'} 
          bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col 
          fixed md:relative h-[calc(100vh-64px)] z-10 shadow-sm
        `}>
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center justify-start h-11 px-4 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
              v1.4.0 Stable Engine
          </div>
        </aside>

        {/* ------------------- MAIN CONTENT ------------------- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      <RegisterUserModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;