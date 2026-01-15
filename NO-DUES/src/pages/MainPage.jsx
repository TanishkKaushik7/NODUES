import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Building, Sparkles, Zap, Shield, Lock, ArrowRight, 
  CheckCircle2, Clock, FileText, TrendingUp, Users, Award, 
  ChevronRight, MapPin, Phone, Mail, Facebook, Youtube, 
  Twitter, Instagram, Globe, Menu, ChevronDown, X 
} from 'lucide-react';

export default function MainPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
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
    <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 transform hover:scale-105 transition-all duration-300 group overflow-hidden`}>
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
      <Icon className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-sm font-semibold text-white">{text}</span>
    </div>
  );

  const footerLinks = {
    students: ['Timetables', 'Examinations', 'Scholarship', 'National Service Scheme (NSS)', 'Student Portal', 'Academic Bank of Credits (ABC)', 'UGC Guidelines'],
    employee: ['Leave/Medical Forms', 'Online Maintenance', 'Complaint Form'],
    important: ['Anti Ragging Committee', 'IQAC', 'NAAC', 'NIRF', 'RUSA', 'Shodhganga', 'IRINSGBU'],
    youtube: ['Electrical Engg.', 'Applied Mathematics', 'Electronics & Communication Engg.']
  };

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Schools', href: '#', dropdown: ['ICT', 'Management', 'Engineering', 'Biotechnology'] },
    { name: 'Administration', href: '#' },
    { name: 'Academics', href: '#' },
    { name: 'Contact', href: '#' }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      
      {/* Ultra Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-radial from-cyan-500/20 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{ left: `${mousePosition.x - 300}px`, top: `${mousePosition.y - 300}px` }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.03)_50%)] bg-[length:100%_4px] animate-scan pointer-events-none"></div>
      </div>

      {/* ✅ GLASSY HEADER SECTION */}
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className={`relative flex items-center justify-between px-6 py-3 rounded-2xl border transition-all duration-500 ${
            scrolled 
            ? 'bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl shadow-cyan-500/10' 
            : 'bg-white/5 backdrop-blur-md border-white/5'
          }`}>
            {/* Logo Area */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-cyan-500 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img src="https://www.gbu.ac.in/Content/img/logo_gbu.png" alt="GBU Logo" className="w-8 h-8 object-contain" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter leading-none text-white">GAUTAM BUDDHA</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">UNIVERSITY</span>
              </div>
            </div>

            
            {/* Portal Toggle Button */}
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

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pt-40 py-12 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-xl shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Registry Verified Portal
            </span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none">
            <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-2xl animate-gradient bg-[length:200%_auto]">
              No Dues Portal
            </span>
          </h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
          <StatCard icon={Users} value="1K+" label="Active Students" gradient="from-cyan-500/20 to-blue-500/20" />
          <StatCard icon={CheckCircle2} value="98%" label="Success Rate" gradient="from-emerald-500/20 to-teal-500/20" />
          <StatCard icon={Clock} value="24h+" label="Avg. Process Time" gradient="from-violet-500/20 to-purple-500/20" />
          <StatCard icon={Award} value="7+" label="Departments" gradient="from-orange-500/20 to-rose-500/20" />
        </div>

        {/* Portals Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Student Portal */}
          <div className="group relative" onMouseEnter={() => setActiveCard('student')} onMouseLeave={() => setActiveCard(null)}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-3xl opacity-20 group-hover:opacity-60 blur-xl transition-all duration-700 animate-gradient bg-[length:200%_auto]"></div>
            <div className="relative h-full bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-8 overflow-hidden shadow-2xl">
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 backdrop-blur-xl shadow-lg shadow-cyan-500/20">
                    <User className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">LIVE</span>
                  </div>
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">Student Portal</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  <FeatureBadge icon={Zap} text="Instant Upload" />
                  <FeatureBadge icon={Shield} text="Secure" />
                  <FeatureBadge icon={TrendingUp} text="Live Tracking" />
                </div>
                <div className="space-y-3 mb-8">
                  {['Real-time status tracking', 'One-click submission', 'Automated processing'].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/item">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm font-medium text-gray-300">{t}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover/item:translate-x-1" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigate('/student/login')} className="flex-1 py-4 bg-white text-black font-black text-sm rounded-xl hover:scale-105 transition-all">Sign In</button>
                  <button onClick={() => navigate('/student/register')} className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-sm rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Authority Portal */}
          <div className="group relative" onMouseEnter={() => setActiveCard('authority')} onMouseLeave={() => setActiveCard(null)}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 rounded-3xl opacity-20 group-hover:opacity-60 blur-xl transition-all duration-700 animate-gradient bg-[length:200%_auto]"></div>
            <div className="relative h-full bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-8 overflow-hidden shadow-2xl">
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                    <Building className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1"><Lock className="w-3 h-3" /> SECURE</span>
                  </div>
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">Authority Portal</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  <FeatureBadge icon={Shield} text="Encrypted" />
                  <FeatureBadge icon={Users} text="Multi-Role" />
                  <FeatureBadge icon={TrendingUp} text="Analytics" />
                </div>
                <div className="space-y-3 mb-8">
                  {['Batch approval workflow', 'Advanced audit logs', 'Role-based access control'].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/item">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">{t}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover/item:translate-x-1" />
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')} className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-black text-sm rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2">Access Dashboard <ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact/Support Bar */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-white/10 backdrop-blur-xl shadow-xl">
            <p className="text-sm text-gray-400">
              Need assistance? Reach out at <span className="text-cyan-400 font-bold underline decoration-cyan-400/30 underline-offset-4 cursor-pointer hover:text-cyan-300 transition-colors">support@gbu.ac.in</span>
            </p>
          </div>
        </div>
      </main>

      {/* ✅ UPDATED FOOTER SECTION */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Gautam Buddha University</h3>
              <div className="space-y-4 text-sm text-slate-400">
                <p>Opp. Yamuna Expressway, Greater NOIDA, Gautam Budh Nagar, UP-201312 (INDIA)</p>
                <div className="flex items-center gap-2 pt-2 text-cyan-400 group cursor-pointer">
                  <Phone className="w-4 h-4" /> <span className="group-hover:underline">0120-2344200</span>
                </div>
              </div>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block capitalize">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link, idx) => (
                    <li key={idx}><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2026 - Gautam Buddha University. Maintained by Central Computer Center.</p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-blue-500 transition-all"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-500 transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-pink-500 transition-all"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes scan { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
        .animate-gradient { animation: gradient 8s ease infinite; }
        .animate-scan { animation: scan 8s linear infinite; }
        .bg-gradient-radial { background-image: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to)); }
      `}</style>
    </div>
  );
}