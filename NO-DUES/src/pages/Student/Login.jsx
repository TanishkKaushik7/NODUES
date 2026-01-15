import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiLock, FiLogIn, FiShield, FiArrowLeft, 
  FiRefreshCw, FiShieldOff, 
  FiEye, FiEyeOff // ✅ Imported Eye Icons
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const StudentLogin = () => {
  const { login } = useStudentAuth();
  const navigate = useNavigate();
  
  // --- Auth States ---
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ New State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  // --- CAPTCHA States ---
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState(null); 
  const [captchaHash, setCaptchaHash] = useState('');    
  const [captchaLoading, setCaptchaLoading] = useState(true);

  // --- 1. CLEAN SLATE PROTOCOL ---
  useEffect(() => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('token');
  }, []);

  /**
   * ✅ Integrated Fetch Captcha Logic
   */
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    setError(''); 
    
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, ''); 
      
      const response = await axios.get(`${API_BASE}/api/captcha/generate`);

      setCaptchaImage(response.data.image); 
      setCaptchaHash(response.data.captcha_hash); 
    } catch (err) {
      console.error("Captcha load failed", err);
      if (err.response?.status === 429) {
          setError("Too many requests. Please wait a moment.");
      } else {
          setError("Security service unavailable. Please refresh.");
      }
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.identifier || !credentials.password) {
        setError("Please enter your ID and Password.");
        return;
    }
    if (!captchaInput) {
        setError("Please enter the security code shown.");
        return;
    }

    setLoading(true);

    try {
      await login({ 
        identifier: credentials.identifier, 
        password: credentials.password,
        captcha_input: captchaInput,
        captcha_hash: captchaHash 
      });
      
      navigate('/student/dashboard');

    } catch (err) {
      let errorMsg = 'Login failed';

      if (err.response?.status === 403) {
        errorMsg = "Access Forbidden. Your account may be locked or credentials invalid.";
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMsg = Array.isArray(detail) ? detail[0].msg : detail;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(String(errorMsg));
      fetchCaptcha(); 
      setCaptchaInput(''); 
      
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="h-screen w-full bg-[#fcfdfe] flex items-center justify-center p-4 overflow-hidden font-sans relative text-slate-900">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/', { replace: true })}
        className="absolute top-6 left-6 p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all z-50 group"
      >
        <FiArrowLeft className="text-slate-600 group-hover:-translate-x-1 transition-transform" size={18} />
      </button>

      <div className="w-full max-w-4xl grid lg:grid-cols-10 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative z-10">
        
        {/* Left Side: Branding */}
        <div className="lg:col-span-4 bg-slate-900 p-10 flex flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
              <FiShield size={24} />
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight uppercase">
              Gautam Buddha <br /> University
            </h1>
            <div className="h-1 w-10 bg-blue-500 mt-4 rounded-full" />
            <p className="text-slate-400 text-[10px] mt-6 font-bold uppercase tracking-[0.25em]">Secure Authentication</p>
          </div>

          <div className="relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium uppercase tracking-widest">
                "Registry Verified Portal"
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Student Sign In</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identity Management System</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <FiShieldOff className="shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className={labelStyle}>Enrollment / Roll No</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    name="identifier"
                    value={credentials.identifier}
                    onChange={handleChange}
                    // ✅ Updated Class: outline-none, ring-1, ring-blue-500
                    className="pl-12 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className={labelStyle}>Password</label>
                  <button type="button" className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider">Forgot?</button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    name="password"
                    // ✅ Dynamic Type
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleChange}
                    // ✅ Updated Class + Padding Right for Eye Icon
                    className="pl-12 pr-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
                    required
                  />
                  
                  {/* ✅ Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer outline-none transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA SECTION */}
              <div className="space-y-1 pt-2 border-t border-slate-50">
                <div className="flex justify-between items-center mb-1">
                    <label className={labelStyle}>Security Verification</label>
                    <button 
                      type="button" 
                      onClick={fetchCaptcha} 
                      className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase flex items-center gap-1 transition-colors"
                      disabled={captchaLoading}
                    >
                      <FiRefreshCw className={captchaLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2 h-11 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    {captchaLoading ? (
                      <div className="w-full h-full animate-pulse bg-slate-200" />
                    ) : (
                      <img 
                        src={captchaImage} 
                        alt="Security Code" 
                        className="h-full w-full object-cover select-none" 
                        draggable="false"
                      />
                    )}
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="CODE"
                      autoComplete="off"
                      // ✅ Updated Class: Thin blue border
                      className="h-11 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-black uppercase tracking-[0.25em] focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || captchaLoading}
                  className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                >
                  {loading ? <FiRefreshCw className="animate-spin" /> : <FiLogIn />} 
                  Authorize Entry
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-slate-50 pt-6">
              <button onClick={() => navigate('/student/register')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
                New Enrollment? <span className="text-blue-600 underline underline-offset-4 decoration-2">Register Here</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;