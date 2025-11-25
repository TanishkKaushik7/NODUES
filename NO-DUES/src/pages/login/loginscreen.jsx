import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiShield, FiArrowLeft } from 'react-icons/fi';
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
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleBackToMain = () => navigate('/', { replace: true });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Use the login function from AuthContext
      const result = await login(credentials);

      // Prefer server-provided role from user object, otherwise decode JWT
      const returnedUser = result?.user || result;
      const returnedToken = result?.token || null;

      const parseJwt = (t) => {
        try {
          const parts = (t || '').split('.');
          if (parts.length < 2) return null;
          const payload = parts[1];
          const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          return JSON.parse(decodeURIComponent(escape(decoded)));
        } catch (e) {
          return null;
        }
      };

      const tokenPayload = returnedToken ? parseJwt(returnedToken) : null;
      const roleFromUser = (returnedUser && returnedUser.role) ? returnedUser.role : null;
      const rawRole = (roleFromUser || tokenPayload?.role || tokenPayload?.roles || tokenPayload?.role || '').toString().toLowerCase();

      // Prefer numeric department_id if provided by the server
      const deptId = (returnedUser && (returnedUser.department_id || returnedUser.dept_id)) || tokenPayload?.department_id || tokenPayload?.dept_id || null;

      const deptNameCandidate = (
        (returnedUser && (returnedUser.department_name || returnedUser.department || returnedUser.dept || returnedUser.unit || returnedUser.office)) ||
        tokenPayload?.department || tokenPayload?.department_name || tokenPayload?.dept || tokenPayload?.unit || tokenPayload?.office || ''
      ).toString().toLowerCase();

      const deptIdToPath = (id) => {
        // Map DB sequence ids to paths (from your SQL insert order)
        // 1: Department (generic) -> fallback to /dashboard
        // 2: Library
        // 3: Hostel
        // 4: Accounts
        // 5: Sports
        // 6: Exam Cell
        const map = {
          1: '/dashboard',
          2: '/library/dashboard',
          3: '/hostels/dashboard',
          4: '/accounts/dashboard',
          5: '/sports/dashboard',
          6: '/exam/dashboard'
        };
        return map[id] || null;
      };

      const roleToPath = (r, id, deptName) => {
        if (!r) return '/dashboard';
        if (r.includes('admin')) return '/admin/dashboard';

        // If department id exists, map directly
        if (id) {
          const byId = deptIdToPath(Number(id));
          if (byId) return byId;
        }

        // If this is a staff account, try department name
        if (r === 'staff' || r.includes('staff')) {
          const d = (deptName || '').replace(/[-_\s]+/g, '');
          if (!d) return '/dashboard';
          if (d.includes('hostel')) return '/hostels/dashboard';
          if (d.includes('account') || d.includes('accounts')) return '/accounts/dashboard';
          if (d.includes('sport')) return '/sports/dashboard';
          if (d.includes('exam')) return '/exam/dashboard';
          if (d.includes('library')) return '/library/dashboard';
          if (d.includes('crc')) return '/crc/dashboard';
          if (d.includes('laboratory') || d.includes('lab')) return '/laboratories/dashboard';
          if (d.includes('office')) return '/office/dashboard';
          return '/dashboard';
        }

        // Non-staff role mapping by role string
        if (r.includes('library')) return '/library/dashboard';
        if (r.includes('hostel') || r.includes('hostels')) return '/hostels/dashboard';
        if (r.includes('accounts') || r.includes('account')) return '/accounts/dashboard';
        if (r.includes('sports')) return '/sports/dashboard';
        if (r.includes('exam')) return '/exam/dashboard';
        if (r.includes('crc')) return '/crc/dashboard';
        if (r.includes('laboratory') || r.includes('laboratories')) return '/laboratories/dashboard';
        if (r.includes('office')) return '/office/dashboard';
        if (r.includes('student')) return '/student/dashboard';
        return '/dashboard';
      };

      const target = roleToPath(rawRole, deptId, deptNameCandidate);
      navigate(target);
    } catch (err) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Invalid credentials. Please try again.');
      setError(msg);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  

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

        {/* Back button to main */}
        <button
          onClick={handleBackToMain}
          className="absolute top-6 left-6 p-2 bg-white rounded-md shadow hover:bg-gray-50"
          aria-label="Back to main"
        >
          <FiArrowLeft className="text-gray-700" />
        </button>

        {/* Login card with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 pb-15 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">System Login</h2>
            <p className="text-gray-600 mb-6 text-center">{portalDescription}</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>

              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mb-5"
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="text"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Enter your Email.........."
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
                  placeholder="Enter your password......."
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