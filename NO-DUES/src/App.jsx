import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext'; // ✅ Import ApplicationsProvider
import LoginScreen from './pages/Login/LoginScreen';

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

// ✅ Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;

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

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;