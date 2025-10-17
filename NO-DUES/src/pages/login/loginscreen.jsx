import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiShield, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const LoginScreen = ({ 
  universityName = "Gautam Buddha University",
  systemName = "NoDues Management System",
  portalDescription = "Sign in to access your dashboard"
}) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'admin' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'office', label: 'Office' },
    { value: 'exam', label: 'Exam' },
    { value: 'sports', label: 'Sports' },
    { value: 'accounts', label: 'Accounts' },
    { value: 'library', label: 'Library' },
    { value: 'hostels', label: 'Hostels' },
    { value: 'crc', label: 'CRC' },
    { value: 'laboratories', label: 'Laboratories' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (roleValue) => {
    setCredentials(prev => ({
      ...prev,
      role: roleValue
    }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Use the login function from AuthContext
      await login(credentials);
      
      // Redirect based on role
      switch(credentials.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'sports':
          navigate('/sports/dashboard');
          break;
        case 'office':
          navigate('/office/dashboard');
          break;
        case 'exam':
          navigate('/exam/dashboard');
          break;
        case 'accounts':
          navigate('/accounts/dashboard');
          break;
          case 'library':
          navigate('/library/dashboard');
          break;
          case 'hostels':
          navigate('/hostels/dashboard');
          break;
          case 'crc':
          navigate('/crc/dashboard');
          break;
          case 'laboratories':
          navigate('/laboratories/dashboard');
          break;
        default:
          navigate('/login');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleLabel = roles.find(role => role.value === credentials.role)?.label;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">{universityName}</h1>
          <p className="text-indigo-700 text-lg">{systemName}</p>
          <div className="mt-2">
            <Badge type="primary" className="inline-flex items-center">
              <FiShield className="mr-1" /> Secure Portal
            </Badge>
          </div>
        </motion.div>

        {/* Login card with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">System Login</h2>
            <p className="text-gray-600 mb-6 text-center">{portalDescription}</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Role Selection Dropdown */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-5"
              >
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span>{selectedRoleLabel}</span>
                    <FiChevronDown className={`transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {roles.map((role) => (
                        <div
                          key={role.value}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                          onClick={() => handleRoleSelect(role.value)}
                        >
                          {role.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mb-5"
              >
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="w-full transition-all duration-300 focus:ring-2 focus:ring-indigo-500"
                  icon={<FiUser className="text-gray-400" />}
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mb-6"
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full transition-all duration-300 focus:ring-2 focus:ring-indigo-500"
                  icon={<FiLock className="text-gray-400" />}
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center border border-transparent rounded-md"
                  disabled={isLoading}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <FiLogIn />
                        </motion.span>
                        Signing In...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="signin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <FiLogIn className="mr-2" />
                        Sign In
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>
            
            {/* Demo credentials hint */}
            <div className="mt-6 p-3 bg-gray-100 rounded-md text-xs text-gray-600">
              <p className="font-medium mb-1">Demo Login:</p>
              <p>Any username/password will work</p>
              <p>Select "Office" role to access Office Dashboard</p>
            </div>
          </Card>
        </motion.div>

        {/* Footer with animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-6 text-xs text-gray-600"
        >
          <p>© 2025 {universityName}. All rights reserved.</p>
          <p>Secure authentication system</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginScreen;