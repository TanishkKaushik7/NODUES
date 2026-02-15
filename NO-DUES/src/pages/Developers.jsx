import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, Code2, Cpu, Globe, ArrowLeft } from 'lucide-react';

export default function Developers() {
  const navigate = useNavigate();

  const team = [
    {
      name: "Lead Developer Name",
      role: "Full Stack Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", // Placeholder
      links: { github: "#", linkedin: "#", mail: "mailto:dev@gbu.ac.in" }
    },
    // Add more team members here
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background Effect (Consistent with Main Page) */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-black"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>

        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Engineering Team</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Behind the Portal</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Developed and maintained by the Central Computer Center (CCC) at GBU. 
            Building digital infrastructure for the next generation of campus management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 transition-all group">
              <div className="relative w-24 h-24 mb-6 mx-auto">
                <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img src={member.image} alt={member.name} className="relative w-full h-full rounded-full border-2 border-white/10 object-cover" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-cyan-400 text-sm font-medium mb-6 uppercase tracking-wider">{member.role}</p>
                
                <div className="flex justify-center gap-4">
                  <a href={member.links.github} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Github className="w-5 h-5" /></a>
                  <a href={member.links.linkedin} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Linkedin className="w-5 h-5" /></a>
                  <a href={member.links.mail} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Mail className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}