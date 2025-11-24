import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">GBU No-Dues System</h1>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <FiMail className="text-white" />
          <a href={`mailto:${user?.email}`} className="text-sm text-white underline-offset-2">{user?.email || 'no-reply'}</a>
        </span>
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