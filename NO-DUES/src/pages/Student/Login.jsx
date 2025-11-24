import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const StudentLogin = () => {
  const { login } = useStudentAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // call common login; backend should determine role by identifier (enrollment/roll/email)
      const payload = { identifier: credentials.identifier, password: credentials.password };
      console.debug('Student login payload:', { identifier: payload.identifier });
      await login(payload);
      // After student login, go to student dashboard
      navigate('/student/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleBackToMain = () => navigate('/', { replace: true });
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
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Gautam Buddha University</h1>
          <p className="text-indigo-700 text-lg">NoDues Management System</p>
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
          <Card className="p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Student Login</h2>
            <p className="text-gray-600 mb-6 text-center">Use your Email to login.</p>

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
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Enrollment or Roll Number</label>
                <Input
                  id="identifier"
                  name="identifier"
                  value={credentials.identifier}
                  onChange={handleChange}
                  placeholder="Enter your Enrollment or Roll Number......"
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your Password........"
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
                  disabled={loading}
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
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
                        Logging In...
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
                        Login
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>

            {/* Not registered link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 mr-1">Not registered yet?</span>
              <button
                type="button"
                onClick={() => navigate('/student/register')}
                className="text-indigo-600 hover:underline font-medium"
              >
                Register here
              </button>
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
          <p>© 2025 Gautam Buddha University. All rights reserved.</p>
          <p>Secure authentication system</p>
        </motion.div>
      </div>
    </div>
  );
  
};

export default StudentLogin;
