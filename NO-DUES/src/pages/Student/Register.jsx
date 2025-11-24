import React, { useState } from 'react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiLogIn, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const StudentRegister = () => {
  const navigate = useNavigate();

  const initialForm = {
    enrollmentNumber: '',
    rollNumber: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  };

  const [form, setForm] = useState(initialForm);
  const { register } = useStudentAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.enrollmentNumber) err.enrollmentNumber = 'Provide Enrollment Number';
    if (!form.rollNumber) err.rollNumber = 'Provide Roll Number';
    if (!form.fullName) err.fullName = 'This field is required';
    if (!form.email) err.email = 'This field is required';
    if (!form.mobileNumber) err.mobileNumber = 'This field is required';
    if (!form.password) err.password = 'This field is required';
    if (!form.confirmPassword) err.confirmPassword = 'This field is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Enter a valid email';
    if (form.password && form.password.length < 6) err.password = 'Password should be at least 6 characters';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Passwords do not match';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      const firstKey = Object.keys(v)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el && el.focus) el.focus();
      return;
    }
    setLoading(true);
    try {
      const payload = {
        enrollment_number: form.enrollmentNumber,
        roll_number: form.rollNumber,
        full_name: form.fullName,
        email: form.email,
        mobile_number: form.mobileNumber,
        password: form.password,
        confirm_password: form.confirmPassword
      };
      console.debug('Register payload:', { enrollment_number: payload.enrollment_number, roll_number: payload.roll_number, full_name: payload.full_name, email: payload.email });
      await register(payload);
      setMessage('Registration successful. Please login.');
      setTimeout(() => navigate('/student/login'), 900);
    } catch (err) {
      setMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () => navigate('/', { replace: true });

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
     {/* Back button to main */}
        <button
          onClick={handleBackToMain}
          className="absolute top-4 left-8 p-2 bg-white rounded-md shadow hover:bg-gray-50"
          aria-label="Back to main"
        >
          <FiArrowLeft className="text-gray-700" />
        </button>

      <div className="w-full max-w-2xl relative">
        {/* Header with animation */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-semibold text-indigo-900 mb-1">Gautam Buddha University</h1>
          <div className="mt-1">
            <Badge type="primary" className="inline-flex items-center">
              <FiShield className="mr-1" /> NoDues Management
            </Badge>
          </div>
        </motion.div>

       

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Student Registration</h2>
            <p className="text-sm text-gray-600 mb-4 text-center">Fill the fields below to create your account</p>

            {message && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                {message}
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Enrollment Number</label>
                  <Input
                    name="enrollmentNumber"
                    value={form.enrollmentNumber}
                    onChange={handleChange}
                    className="border border-gray-200"
                  />
                  {errors.enrollmentNumber && <div className="text-xs text-red-600 mt-1">{errors.enrollmentNumber}</div>}
                </div>

                <div>
                  <label className="block text-sm mb-1">Roll Number</label>
                  <Input
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange}
                    className="border border-gray-200"
                  />
                  {errors.rollNumber && <div className="text-xs text-red-600 mt-1">{errors.rollNumber}</div>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Full Name</label>
                  <Input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="border border-gray-200"
                  />
                  {errors.fullName && <div className="text-xs text-red-600 mt-1">{errors.fullName}</div>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Email ID</label>
                  <Input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="border border-gray-200"
                  />
                  {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Mobile Number</label>
                  <Input
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    required
                    className="border border-gray-200"
                  />
                  {errors.mobileNumber && <div className="text-xs text-red-600 mt-1">{errors.mobileNumber}</div>}
                </div>
                <div>
                  <label className="block text-sm mb-1">Create Password</label>
                  <Input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="border border-gray-200"
                  />
                  {errors.password && <div className="text-xs text-red-600 mt-1">{errors.password}</div>}
                </div>

                <div>
                  <label className="block text-sm mb-1">Confirm Password</label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="border border-gray-200"
                  />
                  {errors.confirmPassword && <div className="text-xs text-red-600 mt-1">{errors.confirmPassword}</div>}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 flex items-center justify-center border border-transparent rounded-md"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span key="reg-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mr-2"><FiLogIn /></motion.span>
                          Registering...
                        </motion.span>
                      ) : (
                        <motion.span key="reg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                          <FiLogIn className="mr-2" />
                          Register
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center rounded-md"
                    onClick={() => navigate('/student/login')}
                  >
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-center">
                      Back to Login
                    </motion.span>
                  </Button>
                </div>

                <div className="mt-3 text-xs text-center text-gray-500">
                  By registering you agree to the university's policies. 
                </div>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-4 text-xs text-gray-600"
        >
          <p>© {new Date().getFullYear()} Gautam Buddha University.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentRegister;
