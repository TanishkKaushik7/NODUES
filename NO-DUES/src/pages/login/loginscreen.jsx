import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiLock, FiLogIn, FiShield, 
  FiArrowLeft, FiRefreshCw, FiAlertCircle,
  FiEye, FiEyeOff 
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const LoginScreen = ({ 
  universityName = "Gautam Buddha University",
  systemName = "NoDues Management System"
}) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaHash, setCaptchaHash] = useState(''); 
  
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const rawBase = import.meta.env.VITE_API_BASE || '';
      const API_BASE = rawBase.replace(/\/+$/g, ''); 
      const response = await axios.get(`${API_BASE}/api/captcha/generate`);
      setCaptchaImage(response.data.image);
      setCaptchaHash(response.data.captcha_hash);
    } catch (err) {
      console.error("Captcha load failed", err);
      setError("Too Many Requests. Please try again later.");
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
    setIsLoading(true);
    setError('');

    try {
      const result = await login({ 
        ...credentials, 
        captcha_input: captchaInput,
        captcha_hash: captchaHash 
      });
      
      const user = result?.user;

      if (user) {
        const rawRole = (user.role || "").toLowerCase().trim();
        
       const roleMap = {
          'admin': '/admin/dashboard',
          'super_admin': '/admin/dashboard',
          'library': '/library/dashboard',
          'sports': '/sports/dashboard',
          'hostel': '/hostels/dashboard',
          'hostels': '/hostels/dashboard',
          'dean': '/school/dashboard',
          'school': '/school/dashboard',
          'accounts': '/accounts/dashboard',
          'account': '/accounts/dashboard',
          'laboratories': '/laboratories/dashboard',
          'laboratory': '/laboratories/dashboard',
          'lab': '/laboratories/dashboard',
          'crc': '/crc/dashboard'
        };

        const targetPath = roleMap[rawRole] || `/${rawRole}/dashboard`;
        
        setTimeout(() => navigate(targetPath, { replace: true }), 100);
      }
    } catch (err) {
      setError(err.message || 'Access Denied.');
      fetchCaptcha(); 
      setCaptchaInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 lg:p-0 overflow-hidden font-sans relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50/50 rounded-full blur-[120px]" />
      </div>

      <button 
        onClick={() => navigate('/', { replace: true })} 
        className="absolute top-8 left-8 p-3 bg-white rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 z-50 border border-slate-100"
      >
        <FiArrowLeft className="text-slate-700" size={20} />
      </button>

      <div className="w-full h-full lg:h-auto max-w-4xl grid lg:grid-cols-10 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative z-10">
        
        {/* Left Side: Institutional Branding */}
        <div className="lg:col-span-4 bg-slate-900 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          </div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
              <FiShield size={28} />
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight uppercase">
              {universityName}
            </h1>
            <div className="h-1 w-12 bg-blue-500 mt-4 rounded-full" />
            <p className="text-slate-400 text-xs mt-6 font-bold uppercase tracking-[0.2em]">{systemName}</p>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Authority Login</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Credentials Required</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-3">
                  <FiAlertCircle className="shrink-0" size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className={labelStyle}>Registered Email</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <Input
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    // ✅ Added outline-none and focus:ring-1 for thin border
                    className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelStyle}>Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter Your Password"
                    // ✅ Added outline-none and focus:ring-1 for thin border
                    className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full"
                    required
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <label className={labelStyle}>Security Check</label>
                  <button type="button" onClick={fetchCaptcha} className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase flex items-center gap-1 transition-colors">
                    <FiRefreshCw className={captchaLoading ? 'animate-spin' : ''} /> Refresh Code
                  </button>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2 h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    {captchaLoading ? (
                      <div className="w-full h-full animate-pulse bg-slate-200" />
                    ) : (
                      <img src={captchaImage} alt="captcha" className="h-full w-full object-contain p-1" />
                    )}
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Type Code"
                      autoComplete="off"
                      // ✅ Added outline-none and focus:ring-1
                      // ✅ Kept placeholder:font-normal to make placeholder thin and text bold
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl uppercase text-center text-xs font-black placeholder:font-normal tracking-[0.25em] focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || captchaLoading}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiLogIn />} 
                  Authorize Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;