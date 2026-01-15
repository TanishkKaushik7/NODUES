import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './contexts/StudentAuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext'; 
import SessionTimeoutModal from './components/modals/SessionTimeoutModal';

// --- PAGE IMPORTS ---
import LoginScreen from './pages/login/loginscreen';
import MainPage from './pages/MainPage';
import StudentEntry from './pages/Student/StudentEntry';
import StudentLogin from './pages/Student/Login';
import StudentRegister from './pages/Student/Register';
import StudentDashboard from './pages/Student/StudentDashboard';

// --- DASHBOARDS ---
import SportsDashboard from './pages/Sports/SportsDashboard';
import CRCDashboard from './pages/CRC/CRCDashboard';
import AccountsDashboard from './pages/Accounts/AccountsDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import HostelsDashboard from './pages/Hostels/HostelsDashboard';
import LabDashboard from './pages/Laboratories/LabDashboard';
import SchoolDashboard from './pages/Schools/SchoolDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

// --- HISTORY PAGES ---
import SportsHistory from './pages/Sports/HistoryPage';
import CRCHistory from './pages/CRC/HistoryPage';
import AccountsHistory from './pages/Accounts/HistoryPage';
import LibraryHistory from './pages/Library/HistoryPage';
import HostelsHistory from './pages/Hostels/HistoryPage';
import LaboratoriesHistory from './pages/Laboratories/HistoryPage';
import SchoolHistory from './pages/Schools/HistoryPage';

import './App.css';
import HomeButton from './components/common/HomeButton';

/* -------------------------------------------------------------------------- */
/* SESSION MANAGER                                                            */
/* -------------------------------------------------------------------------- */

const SessionManager = ({ children }) => {
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const timeoutTimerRef = useRef(null);

  // 15-minute inactivity threshold
  const TIMEOUT_IN_MS = 15 * 60 * 1000; 

  const triggerLogout = useCallback(() => {
    // Immediate cleanup of sensitive local data
    localStorage.removeItem('studentToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
    
    // Log for debugging to ensure this is being reached
    console.warn("Session Manager: Triggering Logout Modal");
    setIsTimeoutModalOpen(true);
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    
    // Check for tokens
    const isActive = localStorage.getItem('studentToken') || localStorage.getItem('token');
    
    if (isActive && !isTimeoutModalOpen) {
      timeoutTimerRef.current = setTimeout(triggerLogout, TIMEOUT_IN_MS);
    }
  }, [triggerLogout, isTimeoutModalOpen]);

  useEffect(() => {
    // 1. Backend Expiry Listener
    const handleApiExpiry = () => {
      console.log("Session Manager: API Expiry Event Detected");
      triggerLogout();
    };

    window.addEventListener('session-expired', handleApiExpiry);

    // 2. Activity tracking events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    // Run initial check
    resetTimer(); 

    return () => {
      window.removeEventListener('session-expired', handleApiExpiry);
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [resetTimer, triggerLogout]);

  const handleRelogin = () => {
    setIsTimeoutModalOpen(false);
    // Hard refresh clears all memory-resident state
    window.location.href = '/'; 
  };

  return (
    <>
      {/* Apply dynamic blurring and desaturation to the background 
        while the modal is active for a premium 'locked' feel.
      */}
      <div className={isTimeoutModalOpen ? "filter blur-2xl pointer-events-none grayscale brightness-50 transition-all duration-700" : "transition-all duration-500"}>
        {children}
      </div>
      <SessionTimeoutModal isOpen={isTimeoutModalOpen} onLogin={handleRelogin} />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* PROTECTION HELPERS                                                         */
/* -------------------------------------------------------------------------- */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; 
  return user ? children : <Navigate to="/login" replace />;
};

const StudentProtectedRoute = ({ children }) => {
  const { student, loading } = useStudentAuth();
  if (loading) return null;
  return student ? children : <Navigate to="/student/login" replace />;
};

const RoleRoutes = ({ Dashboard, HistoryComponent }) => (
  <ProtectedRoute>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="history" element={HistoryComponent ? <HistoryComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </ProtectedRoute>
);

/* -------------------------------------------------------------------------- */
/* ROOT APP COMPONENT                                                         */
/* -------------------------------------------------------------------------- */

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <ApplicationProvider>
          {/* SessionManager wraps everything inside the Providers 
            to ensure it can handle state from either Student or Staff portals.
          */}
          <SessionManager>
            <Routes>
              {/* PUBLIC ENTRY */}
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<LoginScreen />} />
              
              {/* STUDENT FLOW */}
              <Route path="/student" element={<StudentEntry />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/dashboard" element={
                <StudentProtectedRoute>
                  <StudentDashboard />
                </StudentProtectedRoute>
              } />

              {/* ADMINISTRATION */}
              <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* DEPARTMENTAL NODES */}
              <Route path="/sports/*" element={<RoleRoutes Dashboard={SportsDashboard} HistoryComponent={SportsHistory} />} />
              <Route path="/crc/*" element={<RoleRoutes Dashboard={CRCDashboard} HistoryComponent={CRCHistory} />} />
              <Route path="/accounts/*" element={<RoleRoutes Dashboard={AccountsDashboard} HistoryComponent={AccountsHistory} />} />
              <Route path="/library/*" element={<RoleRoutes Dashboard={LibraryDashboard} HistoryComponent={LibraryHistory} />} />
              <Route path="/hostels/*" element={<RoleRoutes Dashboard={HostelsDashboard} HistoryComponent={HostelsHistory} />} />
              <Route path="/laboratories/*" element={<RoleRoutes Dashboard={LabDashboard} HistoryComponent={LaboratoriesHistory} />} />
              
              {/* Alias Support */}
              <Route path="/account/*" element={<Navigate to="/accounts/dashboard" replace />} />
              <Route path="/hostel/*" element={<Navigate to="/hostels/dashboard" replace />} />
              <Route path="/lab/*" element={<Navigate to="/laboratories/dashboard" replace />} />

              {/* SCHOOL DEAN NODE */}
              <Route path="/school/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="dashboard" element={<SchoolDashboard />} />
                    <Route path="history" element={<SchoolHistory />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <HomeButton />
          </SessionManager>
        </ApplicationProvider>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;