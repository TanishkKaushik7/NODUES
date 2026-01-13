import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './contexts/StudentAuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext'; 
import LoginScreen from './pages/login/loginscreen';
import MainPage from './pages/MainPage';
import StudentEntry from './pages/Student/StudentEntry';
import StudentLogin from './pages/Student/Login';
import StudentRegister from './pages/Student/Register';
import StudentDashboard from './pages/Student/StudentDashboard';

// --- DEPARTMENT DASHBOARDS ---
import SportsDashboard from './pages/Sports/SportsDashboard';
import CRCDashboard from './pages/CRC/CRCDashboard';
import AccountsDashboard from './pages/Accounts/AccountsDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import HostelsDashboard from './pages/Hostels/HostelsDashboard';
import LabDashboard from './pages/Laboratories/LabDashboard';
import SchoolDashboard from './pages/Schools/SchoolDashboard';

// --- DEPARTMENT HISTORY PAGES ---
import SportsHistory from './pages/Sports/HistoryPage';
import CRCHistory from './pages/CRC/HistoryPage';
import AccountsHistory from './pages/Accounts/HistoryPage';
import LibraryHistory from './pages/Library/HistoryPage';
import HostelsHistory from './pages/Hostels/HistoryPage';
import LaboratoriesHistory from './pages/Laboratories/HistoryPage';
import SchoolHistory from './pages/Schools/HistoryPage';

// --- ADMIN IMPORT ---
import AdminDashboard from './pages/Admin/AdminDashboard'; // Integrated here

import './App.css';
import HomeButton from './components/common/HomeButton';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const user = auth && auth.user ? auth.user : null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Student protected route
const StudentProtectedRoute = ({ children }) => {
  const studentCtx = useStudentAuth();
  const student = studentCtx && studentCtx.student ? studentCtx.student : null;
  if (!student) return <Navigate to="/student/login" replace />;
  return children;
};

// Role Routes Helper
const RoleRoutes = ({ role, Dashboard, PendingComponent, HistoryComponent, RejectedComponent, CreateComponent }) => (
  <ProtectedRoute>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="pending" element={PendingComponent ? <PendingComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="rejected" element={RejectedComponent ? <RejectedComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="history" element={HistoryComponent ? <HistoryComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="create-user" element={CreateComponent ? <CreateComponent /> : <Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<LoginScreen />} />

          {/* --- ADMIN ROUTE INTEGRATION --- */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Department Routes */}
          <Route path="/sports/*" element={<RoleRoutes role="sports" Dashboard={SportsDashboard} HistoryComponent={SportsHistory} />} />
          <Route path="/crc/*" element={<RoleRoutes role="crc" Dashboard={CRCDashboard} HistoryComponent={CRCHistory} />} />
          <Route path="/accounts/*" element={<RoleRoutes role="accounts" Dashboard={AccountsDashboard} HistoryComponent={AccountsHistory} />} />
          <Route path="/library/*" element={<RoleRoutes role="library" Dashboard={LibraryDashboard} HistoryComponent={LibraryHistory} />} />
          <Route path="/hostels/*" element={<RoleRoutes role="hostels" Dashboard={HostelsDashboard} HistoryComponent={HostelsHistory} />} />
          <Route path="/laboratories/*" element={<RoleRoutes role="laboratories" Dashboard={LabDashboard} HistoryComponent={LaboratoriesHistory} />} />
          
          {/* School/Dean Route */}
          <Route path="/school/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="dashboard" element={<SchoolDashboard />} />
                <Route path="history" element={<SchoolHistory />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Root and Student Routes */}
          <Route path="/" element={<MainPage />} />
          <Route path="/student" element={<StudentAuthProvider><StudentEntry /></StudentAuthProvider>} />
          <Route path="/student/login" element={<StudentAuthProvider><StudentLogin /></StudentAuthProvider>} />
          <Route path="/student/register" element={<StudentAuthProvider><StudentRegister /></StudentAuthProvider>} />
          <Route path="/student/dashboard" element={<StudentAuthProvider><StudentProtectedRoute><StudentDashboard /></StudentProtectedRoute></StudentAuthProvider>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <HomeButton />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;