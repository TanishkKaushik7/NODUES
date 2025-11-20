import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome to your student dashboard.</p>

          <div className="mb-4">
            <p className="font-medium">Name: <span className="font-normal">{user?.name || 'Student'}</span></p>
            <p className="font-medium">Username: <span className="font-normal">{user?.username || '—'}</span></p>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={() => navigate('/pending')}>View Pending Applications</Button>
            <Button variant="outline" onClick={() => navigate('/history')}>Application History</Button>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
