import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Building, Sparkles, Zap, Shield, Lock, ArrowRight, 
  CheckCircle2, Clock, Users, Award, 
  ChevronRight, Phone, Facebook, Youtube, 
  Twitter, Instagram, Menu, X 
} from 'lucide-react';

export default function MainPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const StatCard = ({ icon: Icon, value, label, gradient }) => (
    <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/10 transform hover:scale-105 transition-all duration-300 group overflow-hidden`}>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300"></div>
      <div className="relative flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/10">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-xs text-white/70 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );

  const FeatureBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
      <Icon className="w-4 h-4 text-cyan-400 transition-transform duration-300" />
      <span className="text-sm font-semibold text-white">{text}</span>
    </div>
  );

  const footerLinks = {
    students: ['Timetables', 'Examinations', 'Scholarship', 'NSS', 'Student Portal', 'ABC', 'UGC Guidelines'],
    employee: ['Leave/Medical Forms', 'Online Maintenance', 'Complaint Form'],
    important: ['Anti Ragging', 'IQAC', 'NAAC', 'NIRF', 'RUSA', 'Shodhganga', 'IRINSGBU'],
    youtube: ['Electrical Engg.', 'Applied Maths', 'ECE']
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      
      {/* BACKGROUND - Breathing/Pulse Removed */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-black"></div>
        
        {/* Static Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl"></div>
        
        {/* Interactive Mouse Highlight */}
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{ left: `${mousePosition.x - 300}px`, top: `${mousePosition.y - 300}px` }}
        ></div>
        
        {/* Geometric Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* HEADER */}
      <header className={`static top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className={`relative flex items-center justify-between px-6 py-3 rounded-2xl border transition-all duration-500 ${
            scrolled 
            ? 'bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl shadow-cyan-500/5' 
            : 'bg-white/5 backdrop-blur-md border-white/5'
          }`}>
            {/* Logo Area */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img src="https://www.gbu.ac.in/Content/img/logo_gbu.png" alt="GBU Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter text-white">GAUTAM BUDDHA</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">UNIVERSITY</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/50 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all duration-300"
                onClick={() => navigate('/student/login')}
              >
                <User className="w-3 h-3" /> Quick Access
              </button>
              <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pt-40 py-12 pb-32 text-center">
        {/* Hero Content */}
        <div className="mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400/80">
              Registry Verified Portal
            </span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none text-white">
            No Dues Portal
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
          <StatCard icon={Users} value="1K+" label="Active Students" gradient="from-cyan-500/10 to-blue-500/10" />
          <StatCard icon={CheckCircle2} value="98%" label="Success Rate" gradient="from-emerald-500/10 to-teal-500/10" />
          <StatCard icon={Clock} value="24h+" label="Avg. Process Time" gradient="from-violet-500/10 to-purple-500/10" />
          <StatCard icon={Award} value="7+" label="Departments" gradient="from-orange-500/10 to-rose-500/10" />
        </div>

        {/* Action Portals */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20 text-left">
          {/* Student Portal */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all hover:border-cyan-500/30">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 w-fit mb-6">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-4xl font-black text-white mb-2">Student Portal</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              <FeatureBadge icon={Zap} text="Instant Upload" />
              <FeatureBadge icon={Shield} text="Secure" />
            </div>
            <div className="space-y-3 mb-8">
              {['Real-time status tracking', 'One-click submission'].map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-medium text-gray-300">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/student/login')} className="flex-1 py-4 bg-white text-black font-black text-sm rounded-xl hover:bg-gray-200 transition-all">Sign In</button>
              <button onClick={() => navigate('/student/register')} className="flex-1 py-4 bg-cyan-600 text-white font-black text-sm rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Authority Portal */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all hover:border-purple-500/30">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 w-fit mb-6">
              <Building className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-4xl font-black text-white mb-2">Authority Portal</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              <FeatureBadge icon={Shield} text="Encrypted" />
              <FeatureBadge icon={Users} text="Multi-Role" />
            </div>
            <div className="space-y-3 mb-8">
              {['Batch approval workflow', 'Advanced audit logs'].map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">{t}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/login')} className="w-full py-4 bg-purple-600 text-white font-black text-sm rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2">Access Dashboard <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Support Section */}
        <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl inline-block">
          <p className="text-sm text-gray-400">
            Support: <span className="text-cyan-400 font-bold underline underline-offset-4">support@gbu.ac.in</span>
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-xl py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Gautam Buddha University</h3>
              <p className="text-sm text-slate-400">Opp. Yamuna Expressway, Greater NOIDA, UP-201312</p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <Phone className="w-4 h-4" /> <span>0120-2344200</span>
              </div>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-2 capitalize">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link, idx) => (
                    <li key={idx}><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 text-center text-sm text-slate-500">
            <p>© 2026 - Gautam Buddha University. Maintained by Central Computer Center.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-gradient-radial { background-image: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to)); }
      `}</style>
    </div>
  );
}