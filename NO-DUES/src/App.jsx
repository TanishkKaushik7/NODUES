import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudentAuthProvider } from './contexts/StudentAuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext'; // ✅ Import ApplicationsProvider
import LoginScreen from './pages/login/loginscreen';
import MainPage from './pages/MainPage';
import StudentEntry from './pages/Student/StudentEntry';
import StudentLogin from './pages/Student/Login';
import StudentRegister from './pages/Student/Register';
import StudentDashboard from './pages/Student/StudentDashboard';

// Dashboards
import AdminDashboard from './pages/Admin/AdminDashboard';
import SportsDashboard from './pages/Sports/SportsDashboard';
import OfficeDashboard from './pages/Office/OfficeDashboard';
import ExamDashboard from './pages/Exam/ExamDashboard';
import AccountsDashboard from './pages/Accounts/AccountsDashboard';
import LibraryDashboard from './pages/Library/LibraryDashboard';
import HostelsDashboard from './pages/Hostels/HostelsDashboard';
import LaboratoriesDashboard from './pages/Laboratories/LaboratoriesDashboard';
import CRCDashboard from './pages/CRC/CRCDashboard';

// Shared Pages
import PendingPage from './pages/Shared/PendingPage';
import HistoryPage from './pages/Shared/HistoryPage';

import './App.css';
import HomeButton from './components/common/HomeButton';

// ✅ Protected Route Component (role checks removed)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// ✅ Role Routes (Keeps all pages for a role together)
const RoleRoutes = ({ role, Dashboard }) => (
  <ProtectedRoute allowedRoles={[role]}>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="pending" element={<PendingPage />} />
      <Route path="history" element={<HistoryPage />} />
      {/* Unknown subroutes go back to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      {/* ✅ Wrap with ApplicationsProvider */}
      <ApplicationProvider>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Role Routes */}
          <Route path="/admin/*" element={<RoleRoutes role="admin" Dashboard={AdminDashboard} />} />
          <Route path="/sports/*" element={<RoleRoutes role="sports" Dashboard={SportsDashboard} />} />
          <Route path="/office/*" element={<RoleRoutes role="office" Dashboard={OfficeDashboard} />} />
          <Route path="/exam/*" element={<RoleRoutes role="exam" Dashboard={ExamDashboard} />} />
          <Route path="/accounts/*" element={<RoleRoutes role="accounts" Dashboard={AccountsDashboard} />} />
          <Route path="/library/*" element={<RoleRoutes role="library" Dashboard={LibraryDashboard} />} />
          <Route path="/hostels/*" element={<RoleRoutes role="hostels" Dashboard={HostelsDashboard} />} />
          <Route path="/crc/*" element={<RoleRoutes role="crc" Dashboard={CRCDashboard} />} />
          <Route path="/laboratories/*" element={<RoleRoutes role="laboratories" Dashboard={LaboratoriesDashboard} />} />

          {/* Generic routes (role-agnostic) */}
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/pending" element={<ProtectedRoute><PendingPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

          {/* Root and fallback */}
          <Route path="/" element={<MainPage />} />
          <Route path="/student" element={<StudentAuthProvider><StudentEntry /></StudentAuthProvider>} />
          <Route path="/student/login" element={<StudentAuthProvider><StudentLogin /></StudentAuthProvider>} />
          <Route path="/student/register" element={<StudentAuthProvider><StudentRegister /></StudentAuthProvider>} />
          <Route path="/student/dashboard" element={<StudentAuthProvider><ProtectedRoute><StudentDashboard /></ProtectedRoute></StudentAuthProvider>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <HomeButton />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;