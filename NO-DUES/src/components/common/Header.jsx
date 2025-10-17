import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">GBU No-Dues System</h1>
      <div className="flex items-center gap-4">
        <span>Welcome, {user?.name}</span>
        <button 
          onClick={logout}
          className="bg-white text-indigo-800 px-3 py-1 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;