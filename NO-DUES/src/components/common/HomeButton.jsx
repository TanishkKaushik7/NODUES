import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const HomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Don't show on the landing page
  if (location.pathname === '/') return null;

  return (
    <button
      onClick={() => navigate('/')}
      /* Title removed to eliminate the browser tooltip on hover */
      className="fixed right-8 bottom-8 z-[60] bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 hover:bg-slate-800 transition-all active:scale-95 group overflow-hidden"
    >
      {/* Glow Background optimized for dark visibility */}
      <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-center gap-2">
        {/* Animated text anchored to the right */}
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
          Portal Selection
        </span>
        {/* Icon color changed to white for maximum visibility against the dark button */}
        <FiHome className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </div>
    </button>
  );
};

export default HomeButton;