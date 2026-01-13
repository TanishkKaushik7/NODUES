import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiShield, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
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
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleBackToMain = () => navigate('/', { replace: true });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(credentials);
      
      const returnedUser = result?.user || result;
      const returnedToken = result?.token || null;

      const parseJwt = (t) => {
        try {
          const parts = (t || '').split('.');
          if (parts.length < 2) return null;
          const payload = parts[1];
          const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          return JSON.parse(decodeURIComponent(escape(decoded)));
        } catch (e) { return null; }
      };

      const tokenPayload = returnedToken ? parseJwt(returnedToken) : null;
      
      // --- Role & ID Extraction ---
      const roleFromUser = (returnedUser && returnedUser.role) ? returnedUser.role : null;
      const rawRole = (roleFromUser || tokenPayload?.role || tokenPayload?.user_role || '').toString().toLowerCase();

      const deptId = (returnedUser && (returnedUser.department_id || returnedUser.dept_id)) || tokenPayload?.department_id || null;
      const schoolId = (returnedUser && (returnedUser.school_id)) || tokenPayload?.school_id || null;

      const deptNameCandidate = (
        (returnedUser && (returnedUser.department_name || returnedUser.school_name)) ||
        tokenPayload?.department_name || ''
      ).toString().toLowerCase();

      // --- MAPPING LOGIC (Synchronized with your provided API Responses) ---
      const deptIdToPath = (id) => {
        const map = {
          1: '/library/dashboard',      // Library User (ID 1)
          2: '/hostels/dashboard',      // Hostel User (ID 2)
          3: '/sports/dashboard',       // Sports User (ID 3)
          4: '/laboratories/dashboard',  // Lab User (ID 4)
          5: '/crc/dashboard',           // CRC/Exam User (ID 5)
          6: '/accounts/dashboard'       // Accounts (ID 6)
        };
        return map[id] || null;
      };

      const roleToPath = (r, dId, sId, dName) => {
        // 1. Permanent System Roles
        if (r.includes('admin')) return '/admin/dashboard';
        if (r.includes('student')) return '/student/dashboard';

        // 2. PRIORITY: Explicit Role String Matches
        if (r.includes('crc') || r.includes('exam')) return '/crc/dashboard';
        if (r.includes('hostel')) return '/hostels/dashboard';
        if (r.includes('library')) return '/library/dashboard';
        if (r.includes('lab') || r.includes('laborator') || dName.includes('lab')) {
          return '/laboratories/dashboard';
        }
        if (r.includes('account')) return '/accounts/dashboard';
        if (r.includes('sport')) return '/sports/dashboard';

        // 3. Dean / School Logic (If school_id is provided)
        if (r.includes('dean') || sId || r.includes('school')) return '/school/dashboard';

        // 4. Fallback: Numeric ID Mapping
        if (dId) {
          const byId = deptIdToPath(Number(dId));
          if (byId) return byId;
        }
        
        return '/dashboard'; 
      };

      const target = roleToPath(rawRole, deptId, schoolId, deptNameCandidate);
      console.log(`Routing ${rawRole} (Dept ID: ${deptId}) to ${target}`);
      navigate(target, { replace: true });
      
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">{universityName}</h1>
          <p className="text-indigo-700 text-lg">{systemName}</p>
          <div className="mt-2">
            <Badge type="primary" className="inline-flex items-center">
              <FiShield className="mr-1" /> Secure Portal
            </Badge>
          </div>
        </motion.div>

        <button onClick={handleBackToMain} className="absolute top-6 left-6 p-2 bg-white rounded-md shadow hover:bg-gray-50 transition-colors">
          <FiArrowLeft className="text-gray-700" />
        </button>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 pb-12 shadow-xl bg-white rounded-2xl border border-slate-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">System Login</h2>
            <p className="text-gray-600 mb-8 text-center">{portalDescription}</p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <Input
                  type="text"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                  icon={<FiUser className="text-gray-400" />}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                  icon={<FiLock className="text-gray-400" />}
                />
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                        <FiRefreshCw className="animate-spin mr-2" /> Authenticating...
                      </motion.span>
                    ) : (
                      <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                        <FiLogIn className="mr-2" /> Sign In
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <div className="text-center mt-8 text-xs text-slate-400">
          <p>© 2026 {universityName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;