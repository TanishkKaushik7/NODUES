// Basic Dashboard Template for other roles
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const LaboratoriesDashboard = () => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 1, label: 'Dashboard', path: '/template/dashboard' },
    { id: 2, label: 'Feature 1', path: '/template/feature1' },
    { id: 3, label: 'Feature 2', path: '/template/feature2' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Template Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Statistics</h3>
              <p className="text-3xl font-bold text-indigo-600">0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaboratoriesDashboard;