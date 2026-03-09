import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTachometerAlt, 
  FaHistory, 
  FaSignOutAlt, 
  FaUniversity,
  FaTimes,
  FaBars,
  FaUserCircle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = location.pathname.split('/')[1] || 'dashboard';

  let menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, path: `/${role}/dashboard` },
    { id: 'history', label: 'History', icon: <FaHistory />, path: `/${role}/history` },
  ];

  const [activeItem, setActiveItem] = useState('dashboard');
  
  useEffect(() => {
    const currentPath = location.pathname.split('/').pop();
    setActiveItem(currentPath);
    
    // ✅ RESPONSIVE IMPROVEMENT: Automatically close sidebar on mobile when route changes
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ✅ RESPONSIVE IMPROVEMENT: Overlay/Backdrop for Mobile */}
      {/* This creates a dark background when menu is open on mobile, allowing click-to-close */}
      {isOpen && (
        <div 
          className="fixed inset- z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-[60] p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Sidebar Container */}
      <div 
        className={`fixed md:sticky top-0 h-screen w-72 bg-white border-r border-slate-200 text-slate-600 z-50 transition-transform duration-300 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 shadow-2xl md:shadow-none`} 
        // ✅ RESPONSIVE IMPROVEMENT: Added 'md:translate-x-0' to force visibility on desktop regardless of toggle state
        // ✅ RESPONSIVE IMPROVEMENT: Added 'md:sticky top-0' for better desktop scrolling behavior if needed
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Branding Section */}
          <div className="px-8 py-8 shrink-0">
            <div className="flex items-center space-x-4">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 p-1.5 border border-slate-100">
  <img 
    src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
    alt="GBU Logo" 
    className="w-full h-full object-contain"
  />
</div>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight uppercase">
                  GBU Portal
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Management System
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
            <p className="px-4 mb-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              Menu Principal
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center space-x-3 px-5 py-3 rounded-2xl transition-all duration-300 relative ${
                      activeItem === item.id
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {activeItem === item.id && (
                      <motion.div 
                        layoutId="activeSide"
                        className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" 
                      />
                    )}
                    
                    <span className={`text-xl transition-colors ${activeItem === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile & Logout Section */}
          <div className="p-4 mx-4 mb-4 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm shrink-0">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm shrink-0">
                <FaUserCircle size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tighter">
                  {user?.name || "Officer"}
                </p>
                <p className="text-[9px] text-slate-400 font-medium truncate uppercase">
                  {role} node
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-widest border border-red-100 shadow-sm"
            >
              <FaSignOutAlt size={12} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;