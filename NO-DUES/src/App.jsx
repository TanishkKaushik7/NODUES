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

// Dashboards
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateUser from './pages/Admin/CreateUser';
import SportsDashboard from './pages/Sports/SportsDashboard';
import CRCDashboard from './pages/CRC/CRCDashboard'; // Updated
import AccountsDashboard from './pages/Accounts/AccountsDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import HostelsDashboard from './pages/Hostels/HostelsDashboard';
import LabDashboard from './pages/Laboratories/LabDashboard';

// Admin Pages
import AdminPending from './pages/Admin/PendingPage';
import AdminHistory from './pages/Admin/HistoryPage';
import AdminRejected from './pages/Admin/RejectedPage';

// Sports Pages
import SportsHistory from './pages/Sports/HistoryPage';

// CRC Pages
import CRCHistory from './pages/CRC/HistoryPage'; // Updated variable name from ExamHistory

// Accounts Pages
import AccountsHistory from './pages/Accounts/HistoryPage';

// Library Pages
import LibraryHistory from './pages/Library/HistoryPage';

// Hostels Pages
import HostelsHistory from './pages/Hostels/HistoryPage';

// Laboratories Pages
import LaboratoriesHistory from './pages/Laboratories/HistoryPage';

// --- School Pages ---
import SchoolDashboard from './pages/Schools/SchoolDashboard';
import SchoolHistory from './pages/Schools/HistoryPage';

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

          {/* Role Routes */}
          <Route path="/admin/*" element={<RoleRoutes role="admin" Dashboard={AdminDashboard} PendingComponent={AdminPending} HistoryComponent={AdminHistory} RejectedComponent={AdminRejected} CreateComponent={CreateUser} />} />
          <Route path="/sports/*" element={<RoleRoutes role="sports" Dashboard={SportsDashboard} HistoryComponent={SportsHistory} />} />
          
          {/* UPDATED: CRC Route instead of Exam */}
          <Route path="/crc/*" element={<RoleRoutes role="crc" Dashboard={CRCDashboard} HistoryComponent={CRCHistory} />} />
          
          <Route path="/accounts/*" element={<RoleRoutes role="accounts" Dashboard={AccountsDashboard}  HistoryComponent={AccountsHistory} />} />
          <Route path="/library/*" element={<RoleRoutes role="library" Dashboard={LibraryDashboard} HistoryComponent={LibraryHistory} />} />
          <Route path="/hostels/*" element={<RoleRoutes role="hostels" Dashboard={HostelsDashboard} HistoryComponent={HostelsHistory} />} />
          <Route path="/laboratories/*" element={<RoleRoutes role="laboratories" Dashboard={LabDashboard} LaboratoriesHistory={LaboratoriesHistory} />} />
          
          {/* School Route */}
          <Route path="/school/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="dashboard" element={<SchoolDashboard />} />
                <Route path="history" element={<SchoolHistory />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Generic routes */}
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          
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