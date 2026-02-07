import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiLock, FiLogIn, FiShield, FiArrowLeft, 
  FiRefreshCw, FiAlertCircle, FiEye, FiEyeOff 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Integrated Input Component
const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base md:text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));

// Integrated Button Component
const Button = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));

const StudentLogin = () => {
  const { login } = useStudentAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState(null); 
  const [captchaHash, setCaptchaHash] = useState('');     
  const [captchaLoading, setCaptchaLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentUser');
    localStorage.removeItem('token');
  }, []);

  const fetchCaptcha = async (preserveError = false) => {
    setCaptchaLoading(true);
    if (!preserveError) setError(''); 
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, ''); 
      const response = await axios.get(`${API_BASE}/api/captcha/generate`);
      setCaptchaImage(response.data.image); 
      setCaptchaHash(response.data.captcha_hash); 
    } catch (err) {
      if (!preserveError) setError("Security service unavailable.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => { fetchCaptcha(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.identifier || !credentials.password || !captchaInput) {
      setError("Please complete all fields.");
      return;
    }

    setLoading(true);
    try {
      await login({ 
        identifier: credentials.identifier, 
        password: credentials.password,
        captcha_input: captchaInput,
        captcha_hash: captchaHash,
        captcha_ts: Date.now() 
      });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed.');
      fetchCaptcha(true); 
      setCaptchaInput(''); 
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="min-h-screen w-full bg-[#fcfdfe] flex items-center justify-center p-4 font-sans relative text-slate-900">
      <button onClick={() => navigate('/', { replace: true })} className="absolute top-4 left-4 p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all z-50 group">
        <FiArrowLeft className="text-slate-600 group-hover:-translate-x-1 transition-transform" size={18} />
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-10 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative z-10">
        
        {/* Left Panel: Branding */}
        <div className="lg:col-span-4 bg-slate-900 p-10 flex flex-col justify-between text-white relative">
          <div className="relative z-10">
            {/* --- UPDATED LOGO SECTION --- */}
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-white/5 p-2">
              <img 
                src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
                alt="GBU Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* ----------------------------- */}
            <h1 className="text-2xl font-black leading-tight tracking-tight uppercase">
              Gautam Buddha <br /> University
            </h1>
            <p className="text-slate-400 text-[10px] mt-6 font-bold uppercase tracking-[0.25em]">
              Secure Authentication
            </p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Student Sign In</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Session Protected</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <FiAlertCircle size={14} /> <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelStyle}>Roll No./Enrollment No.</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input name="identifier" value={credentials.identifier} onChange={handleChange} className="pl-12 h-11 bg-slate-50 border-slate-200 rounded-xl font-bold" placeholder="Roll No./Enrollment No." required />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className={labelStyle}>Password</label>
                <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Forgot?</button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Input name="password" type={showPassword ? "text" : "password"} value={credentials.password} onChange={handleChange} className="pl-12 pr-10 h-11 bg-slate-50 border-slate-200 rounded-xl font-bold" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">{showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className={labelStyle}>Security Code</label>
                <button type="button" onClick={() => fetchCaptcha(false)} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1" disabled={captchaLoading}>
                  <FiRefreshCw className={captchaLoading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2 h-11 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                  {captchaLoading ? <div className="animate-pulse bg-slate-200 w-full h-full" /> : <img src={captchaImage} alt="Captcha" className="h-full w-full object-cover" />}
                </div>
                <div className="col-span-3">
                  <Input value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Type Code" className="h-11 bg-slate-50 text-center font-black uppercase tracking-[0.2em]" required />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading || captchaLoading} className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg active:scale-95">
                {loading ? <FiRefreshCw className="animate-spin" /> : <FiLogIn />} Authorize Entry
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
};

export default StudentLogin;