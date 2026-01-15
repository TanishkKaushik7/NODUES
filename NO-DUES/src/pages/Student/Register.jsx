import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiLogIn, FiArrowLeft, FiUser, FiMail, 
  FiPhone, FiHash, FiLock, FiCheckCircle, FiRefreshCw 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- INTEGRATED UI COMPONENTS ---

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  return (
    <button
      className={cn(baseStyles, className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// --- MAIN REGISTRATION COMPONENT ---

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useStudentAuth();

  const [form, setForm] = useState({
    enrollmentNumber: '',
    rollNumber: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    schoolId: '',
    password: '',
    confirmPassword: '',
  });

  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaHash, setCaptchaHash] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const schoolOptions = [
    { id: 1, name: 'School of ICT', code: 'SOICT' },
    { id: 2, name: 'School of Management', code: 'SOM' },
    { id: 3, name: 'School of Engineering', code: 'SOE' },
    { id: 4, name: 'School of Biotechnology', code: 'SOBT' },
    { id: 5, name: 'School of VSAS', code: 'SOVSAS' },
    { id: 6, name: 'School of SOHSS', code: 'SOHSS' },
  ];

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

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
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'enrollmentNumber' || name === 'mobileNumber') {
      val = value.replace(/\D/g, '').slice(0, name === 'mobileNumber' ? 10 : 15);
    }
    setForm(prev => ({ ...prev, [name]: val }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.enrollmentNumber) err.enrollmentNumber = 'Required';
    if (!form.rollNumber) err.rollNumber = 'Required';
    if (!form.fullName) err.fullName = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email';
    if (form.mobileNumber.length !== 10) err.mobileNumber = '10 digits required';
    if (!form.schoolId) err.schoolId = 'Select School';
    if (form.password.length < 6) err.password = 'Min 6 chars';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Mismatch';
    if (!captchaInput) err.captcha = 'Required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) return setErrors(v);

    setLoading(true);
    try {
      await register({
        enrollment_number: form.enrollmentNumber,
        roll_number: form.rollNumber,
        full_name: form.fullName,
        mobile_number: form.mobileNumber,
        email: form.email,
        school_id: Number(form.schoolId),
        password: form.password,
        confirm_password: form.confirmPassword,
        captcha_input: captchaInput,
        captcha_hash: captchaHash
      });
      setMessage('Success! Redirecting...');
      setTimeout(() => navigate('/student/login'), 1500);
    } catch (err) {
      setMessage(err.message || 'Registration failed.');
      fetchCaptcha();
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block";
  const inputContainer = "relative transition-all duration-200 focus-within:transform focus-within:scale-[1.01]";

  return (
    <div className="h-screen w-full bg-[#fcfdfe] flex items-center justify-center p-4 lg:p-0 overflow-hidden font-sans relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl" />
      </div>

      <button
        onClick={() => navigate('/', { replace: true })}
        className="absolute top-6 left-6 p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 z-50 transition-all"
      >
        <FiArrowLeft className="text-slate-600" size={18} />
      </button>

      <div className="w-full max-w-4xl grid lg:grid-cols-12 gap-0 bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative z-10">
        
        <div className="lg:col-span-4 bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <FiShield size={24} />
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight uppercase">Gautam Buddha <br /> University</h1>
            <p className="text-slate-400 text-xs mt-4 font-medium uppercase tracking-[0.2em]">Student Registry</p>
          </div>
        </div>

        <div className="lg:col-span-8 p-6 lg:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Student Registration</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Create your academic profile</p>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mb-4 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${message.includes('Success') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {message.includes('Success') ? <FiCheckCircle /> : <FiRefreshCw />} {message}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelStyle}>Enrollment No</label>
                  <div className={inputContainer}>
                    <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={14} />
                    <Input name="enrollmentNumber" value={form.enrollmentNumber} onChange={handleChange} placeholder="Enrollment Number" className={`pl-10 h-10 text-xs font-bold ${errors.enrollmentNumber ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Roll Number</label>
                  <div className={inputContainer}>
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={14} />
                    <Input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="e.g. 23ICS" className={`pl-10 h-10 text-xs font-bold uppercase ${errors.rollNumber ? 'border-red-300' : 'border-slate-200'}`} />
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className={labelStyle}>Full Name</label>
                  <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="As per official documents" className="h-10 text-xs font-bold bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Official Email</label>
                  <Input name="email" value={form.email} onChange={handleChange} placeholder="name@gbu.ac.in" className="h-10 text-xs font-bold bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Mobile</label>
                  <Input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="10 Digits" className="h-10 text-xs font-bold bg-slate-50" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className={labelStyle}>Academic School</label>
                  <select name="schoolId" value={form.schoolId} onChange={handleChange} className="w-full h-10 px-4 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 outline-none">
                    <option value="">Select University School</option>
                    {schoolOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Password</label>
                  <Input name="password" type="password" value={form.password} onChange={handleChange} className="h-10 text-xs font-bold bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className={labelStyle}>Confirm</label>
                  <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="h-10 text-xs font-bold bg-slate-50" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className={labelStyle}>Security Verification</label>
                  <button type="button" onClick={fetchCaptcha} className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase flex items-center gap-1 transition-colors">
                    <FiRefreshCw className={captchaLoading ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2 h-11 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    {captchaLoading ? <div className="animate-pulse bg-slate-200 w-full h-full" /> : <img src={captchaImage} alt="Captcha" className="h-full w-full object-cover select-none" draggable="false" />}
                  </div>
                  <div className="col-span-3">
                    <Input value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Type Code" className="h-11 bg-slate-50 border-slate-200 rounded-xl text-center text-xs font-black uppercase tracking-[0.2em] focus:bg-white w-full" required />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center gap-4">
                <Button type="submit" disabled={loading || captchaLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                  {loading ? <FiRefreshCw className="animate-spin" /> : <FiLogIn />} Register Account
                </Button>
                <button type="button" onClick={() => navigate('/student/login')} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest">
                  Already have an account? <span className="text-blue-500 underline underline-offset-4">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentRegister;