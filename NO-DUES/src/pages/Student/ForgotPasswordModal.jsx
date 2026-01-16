import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiShield, FiLock, FiArrowRight, 
  FiRefreshCw, FiCheckCircle, FiX, FiAlertCircle 
} from 'react-icons/fi';
import axios from 'axios';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  // Steps: 'email' -> 'otp' -> 'reset' -> 'success'
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [email, setEmail] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Captcha State
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/g, '');

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/captcha/generate`);
      setCaptchaImage(res.data.image);
    } catch (err) {
      console.error("Captcha error", err);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
      setStep('email');
      setError('');
    }
  }, [isOpen]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/verification/forgot-password`, {
        email,
        captcha_input: captchaInput
      });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/verification/verify-reset-otp`, {
        email,
        otp
      });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/verification/reset-password`, {
        email,
        otp,
        new_password: newPassword
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <FiX size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              {step === 'success' ? <FiCheckCircle size={24} /> : <FiLock size={24} />}
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'New Password'}
              {step === 'success' && 'Reset Complete'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {step === 'email' && 'Enter your registered email to receive OTP'}
              {step === 'otp' && `Enter the code sent to ${email}`}
              {step === 'reset' && 'Create a strong new password'}
              {step === 'success' && 'Your password has been successfully updated'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Captcha</label>
                  <button type="button" onClick={fetchCaptcha} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1">
                    <FiRefreshCw className={captchaLoading ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    {captchaImage && <img src={captchaImage} alt="captcha" className="h-full w-full object-cover" />}
                  </div>
                  <input 
                    type="text" required value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full px-4 h-12 bg-slate-50 border uppercase border-slate-200 rounded-xl text-center font-black tracking-widest focus:bg-white outline-none"
                    placeholder="CODE"
                  />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                {loading ? <FiRefreshCw className="animate-spin" /> : 'Send Reset OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                <div className="relative">
                  <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-black tracking-[0.5em] focus:bg-white outline-none"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                {loading ? <FiRefreshCw className="animate-spin" /> : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* Step 3: Reset Password Form */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full h-12 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                {loading ? <FiRefreshCw className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-4">
              <p className="text-center text-slate-500 text-sm font-medium">You can now login with your new credentials.</p>
              <button onClick={onClose} className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;