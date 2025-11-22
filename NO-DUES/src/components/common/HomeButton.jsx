import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const HomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on main page
  if (location.pathname === '/') return null;

  return (
    <button
      onClick={() => navigate('/')}
      title="Home"
      className="fixed right-6 bottom-6 z-50 bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all"
    >
      <FiHome className="w-5 h-5 text-blue-600" />
    </button>
  );
};

export default HomeButton;
