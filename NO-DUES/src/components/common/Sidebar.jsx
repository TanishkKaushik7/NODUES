import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaClock, 
  FaHistory, 
  FaSignOutAlt, 
  FaUniversity,
  FaTimes,
  FaBars 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // ✅ Extract role from URL path (e.g., /hostels/dashboard -> hostels)
  const role = location.pathname.split('/')[1] || 'dashboard';

  // Role-based menu items
  // Role-based menu items
  let menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="text-lg" />, path: `/${role}/dashboard` },
    { id: 'history', label: 'History', icon: <FaHistory className="text-lg" />, path: `/${role}/history` },
  ];

  if (role === 'laboratories') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="text-lg" />, path: `/${role}/dashboard` },
      { id: 'history', label: 'History', icon: <FaHistory className="text-lg" />, path: `/${role}/history` },
    ];
  } else if (role === 'schools') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="text-lg" />, path: `/${role}/dashboard` },
      { id: 'history', label: 'History', icon: <FaHistory className="text-lg" />, path: `/${role}/history` },
    ];
  }

  // ✅ Determine active item based on current route
  const [activeItem, setActiveItem] = useState('dashboard');
  useEffect(() => {
    const currentPath = location.pathname.split('/').pop(); // e.g. "dashboard"
    setActiveItem(currentPath);
  }, [location.pathname]);

  const handleLogout = () => {
    logout(); // call logout from AuthContext
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:relative w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white h-full z-40 transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Branding */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl shadow-md">
                <FaUniversity className="text-2xl text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Gautam Buddha</h1>
                <p className="text-xs text-blue-200">University</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeItem === item.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-blue-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <FaSignOutAlt />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
