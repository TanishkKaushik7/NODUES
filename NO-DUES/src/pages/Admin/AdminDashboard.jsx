import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Settings, Menu, Loader2, User, 
  LogOut, ArrowRight, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminNavigation } from '../../utils/navigation';
import { useNavigate } from 'react-router-dom';

// Widgets & Pages
import DashboardStats from './DashboardStats';
import PerformanceChart from './PerformanceChart';
import RecentLogsWidget from './RecentLogsWidget';
import QuickActions from './QuickActions';
import SystemMetricsWidget from './SystemMetricsWidget';
import UserManagement from './UserManagement';
import SchoolDeptManagement from './SchoolDeptManagement';
import AuditLogs from './AuditLogs';
import Reports from './Reports';
import ApplicationManagement from './ApplicationManagement';

// Modals
import RegisterUserModal from './RegisterUserModal';
import ProfileModal from './ProfileModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import ApplicationInspectionModal from './AdminApplicationModals'; // ✅ NEW IMPORT

const AdminDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Navigation Logic
  const sidebarItems = getAdminNavigation(user?.role);

  // Search & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], applications: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Management
  const [modalOpen, setModalOpen] = useState({ 
    register: false, 
    profile: false, 
    logout: false,
    inspection: false // ✅ Updated: 'inspection' instead of 'action'
  });

  // ✅ New State for Inspector
  const [selectedInspectId, setSelectedInspectId] = useState(null);
  const [selectedRollNo, setSelectedRollNo] = useState(null);

  const searchRef = useRef(null);
  const settingsRef = useRef(null);

  // Guard: Redirect non-admins
  useEffect(() => {
    if (user && !['admin', 'super_admin', 'dean', 'hod', 'registrar'].includes(user.role)) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Global Search logic with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        try {
          const res = await authFetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data || { students: [], applications: [] });
            setShowSearchResults(true);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowSearchResults(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, authFetch]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target)) setIsSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ACTION: UPDATED SELECTION LOGIC (Bridges Student -> App ID)
  const handleSelectApplication = async (item) => {
    // 1. If it's already an application object (Direct Click)
    if (item.status) {
      setSelectedInspectId(item.id);
      setSelectedRollNo(item.roll_number || item.student_roll); // Try to capture roll if available
      setModalOpen(prev => ({ ...prev, inspection: true }));
      setShowSearchResults(false);
      setSearchQuery('');
      return;
    }

    // 2. If it's a student record (Need to find their App ID first)
    setIsSearching(true);
    try {
      const q = item.roll_number || item.rollNo;
      const res = await authFetch(`/api/applications/status?search_query=${encodeURIComponent(q)}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setSelectedInspectId(data.application.id);
          setSelectedRollNo(q); // We know the roll number used for search
          setModalOpen(prev => ({ ...prev, inspection: true }));
        } else {
          alert("No active No-Dues application found for this student.");
        }
      }
    } catch (error) {
      console.error("Error bridging student to application:", error);
    } finally {
      setIsSearching(false);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  // ✅ ACTION: Handle Approval/Rejection (Compatible with new Modal)
  const handleModalAction = async (appObj, action, remark) => {
    // appObj will be { id: "..." } from the new modal
    setActionLoading(true);
    try {
      const appId = appObj.id || appObj.application_id;
      const res = await authFetch(`/api/approvals/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, remark })
      });
      
      if (res.ok) {
        // Success: Close modal and refresh whatever view is active
        setModalOpen(p => ({ ...p, inspection: false }));
        setSelectedInspectId(null);
        return null; 
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to process request.");
        return errData.message;
      }
    } catch (err) {
      alert("Network error. Please try again.");
      return "Network error";
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Management Overview</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Welcome back, <span className="text-blue-600 font-bold">{user?.name}</span>
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Status</p>
                    <p className="text-[10px] font-bold text-green-500 uppercase flex items-center justify-end gap-1">
                       <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Operational
                    </p>
                 </div>
              </div>
            </div>
            
            <DashboardStats />
            
            <div className="grid gap-6 lg:grid-cols-7">
              <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <PerformanceChart />
              </div>
              <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <RecentLogsWidget onNavigate={() => setActiveTab('audit')} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
              <div className="lg:col-span-3">
                <QuickActions 
                  onRegisterUser={() => setModalOpen({ ...modalOpen, register: true })} 
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              </div>
              <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <SystemMetricsWidget />
              </div>
            </div>
          </div>
        );
      case 'applications': return <ApplicationManagement />;
      case 'users': return <UserManagement />;
      case 'schools': return <SchoolDeptManagement />;
      case 'audit': return <AuditLogs />;
      case 'reports': return <Reports />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden h-screen">
      
      {/* --- TOP HEADERBAR --- */}
      <header className="h-20 bg-[#1e40af] text-white flex items-center justify-between px-8 shadow-xl z-30 sticky top-0 shrink-0 border-b border-blue-800/50">
        <div className="flex items-center gap-6">
          <button className="md:hidden p-2 hover:bg-blue-700 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight uppercase cursor-default select-none">GBU No Dues</h1>
            <span className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">Management Console</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-12 hidden md:block relative" ref={searchRef}>
          <div className="relative group">
            {isSearching ? (
              <Loader2 className="absolute left-4 top-3 h-5 w-5 text-blue-400 animate-spin z-10" />
            ) : (
              <Search className="absolute left-4 top-3 h-5 w-5 text-blue-200 group-focus-within:text-blue-600 z-10 transition-colors" />
            )}
            <input
              type="search"
              placeholder="Search Student Name, Roll No, or ND-ID..."
              className="w-full bg-white/10 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder-blue-200 focus:placeholder-slate-400 pl-12 h-11 rounded-2xl border border-white/10 focus:ring-8 focus:ring-blue-400/10 outline-none text-sm shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
            />
          </div>

          <AnimatePresence>
            {showSearchResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-14 left-0 right-0 bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden z-[100] p-4"
              >
                <div className="max-h-[400px] overflow-y-auto space-y-1 custom-scrollbar">
                  
                  {/* Results: Applications */}
                  {searchResults.applications?.length > 0 && (
                    <div className="mb-4">
                       <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Applications</p>
                       {searchResults.applications.map(app => (
                        <button key={app.id} onClick={() => handleSelectApplication(app)} className="w-full flex items-center gap-4 p-3 hover:bg-blue-50/50 rounded-2xl text-left transition-all group">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px]">ND</div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{app.student_name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              {app.display_id} • <span className="text-emerald-600">{app.status}</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results: Students */}
                  {searchResults.students?.length > 0 && (
                    <div>
                      <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Profiles</p>
                      {searchResults.students.map(s => (
                        <button key={s.id} onClick={() => handleSelectApplication(s)} className="w-full flex items-center gap-4 p-3 hover:bg-blue-50/50 rounded-2xl text-left transition-all group">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">{s.full_name?.[0] || 'S'}</div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800">{s.full_name || s.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{s.roll_number || s.rollNo}</div>
                          </div>
                          <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase opacity-0 group-hover:opacity-100 transition-opacity">Fetch Case</span>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.applications.length === 0 && searchResults.students.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No matching records found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Info & Settings */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-90">
              <Settings className={`h-5 w-5 ${isSettingsOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
            </button>
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-4 w-64 bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden z-50 p-3">
                  <div className="px-4 py-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed In As</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[9px] font-black text-blue-600 uppercase mt-1">{user?.role}</p>
                  </div>
                  <button onClick={() => { setModalOpen({...modalOpen, profile: true}); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors font-bold text-[10px] uppercase tracking-widest">
                    <User size={16} className="text-blue-500" /> Admin Profile
                  </button>
                  <button onClick={() => { setModalOpen({...modalOpen, logout: true}); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-[10px] uppercase tracking-widest">
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-white text-blue-700 flex items-center justify-center font-black text-xs shadow-lg uppercase select-none border-2 border-blue-400/20">
            {user?.name?.substring(0, 2)}
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT (SIDEBAR + CONTENT) --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
          <div className="flex-1 overflow-y-auto py-10 px-6 space-y-3 custom-scrollbar">
            {sidebarItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center h-14 px-6 rounded-[1.25rem] text-[10px] uppercase tracking-[0.2em] font-black transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <item.icon className={`mr-4 h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'} transition-transform group-hover:scale-110`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
               <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <HelpCircle size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-800">Support Hub</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">View documentation</p>
               </div>
            </div>
            <button 
              onClick={() => setModalOpen({ ...modalOpen, logout: true })}
              className="w-full flex items-center h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 hover:bg-red-100 transition-all group border border-red-100"
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* --- GLOBAL MODALS --- */}
      <RegisterUserModal 
        isOpen={modalOpen.register} 
        onClose={() => setModalOpen(p => ({ ...p, register: false }))} 
      />
      <ProfileModal 
        isOpen={modalOpen.profile} 
        onClose={() => setModalOpen(p => ({ ...p, profile: false }))} 
      />
      <LogoutConfirmModal 
        isOpen={modalOpen.logout} 
        onClose={() => setModalOpen(p => ({ ...p, logout: false }))} 
      />
      
      {/* ✅ NEW: Application Inspection Modal (Replaces old Action Modal) */}
      <ApplicationInspectionModal
        isOpen={modalOpen.inspection}
        onClose={() => {
            setModalOpen(p => ({ ...p, inspection: false }));
            setSelectedInspectId(null);
            setSelectedRollNo(null);
        }}
        applicationId={selectedInspectId}
        rollNumber={selectedRollNo}
        onAction={handleModalAction}
      />
    </div>
  );
};

export default AdminDashboard;