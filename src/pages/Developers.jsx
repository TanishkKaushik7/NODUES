import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail, Code2, ArrowLeft, Award, Instagram } from 'lucide-react';

export default function Developers() {
  const navigate = useNavigate();

  // Helper function to generate Gmail Web Link
  const getGmailWebLink = (email) => `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;

  const mentor = {
    name: "Dr. Arun Solanki",
    role: "Project Mentor",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun",
    links: { 
      github: "#", 
      linkedin: "#", 
      mail: "arunsolanki@gbu.ac.in" 
    }
  };

  const team = [
    {
      name: "Aditya Kumar Srivastav",
      role: "Team Lead",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lead",
      links: { github: "#", linkedin: "#", mail: "aditya@example.com" }
    },
    {
      name: "Akshit Singh",
      role: "Full Stack Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=FS1",
      links: { 
        github: "https://github.com/akshit-singhh", 
        linkedin: "https://www.linkedin.com/in/akshit-singhh/", 
        instagram: "https://www.instagram.com/akshit.singhh/", 
        mail: "akshitsingh658@gmail.com" 
      }
    },
    {
      name: "Tanishk Kaushik",
      role: "Full Stack Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=FS2",
      links: { 
        github: "https://github.com/TanishkKaushik7", 
        linkedin: "https://www.linkedin.com/in/tanishk-kaushik-738870352", 
        instagram: "https://www.instagram.com/tanishk_kaushik0", 
        mail: "tanishkkaushik089@gmail.com" 
      }
    },
    {
      name: "Manas Jha",
      role: "Deployment & DevOps",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deploy",
      links: { github: "#", linkedin: "#", mail: "manas@example.com" }
    },
    {
      name: "Vernit Goyal",
      role: "Frontend Engineer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Front",
      links: { github: "#", linkedin: "#", mail: "vernit@example.com" }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background Effect */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-black"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Engineering Team</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">The Architects</h1>
          <p className="text-slate-400 max-w-2xl mx-auto italic">
            "Turning complex campus workflows into seamless digital experiences."
          </p>
        </div>

        {/* Mentor Section */}
        <div className="flex justify-center mb-20">
          <div className="w-full max-w-sm bg-gradient-to-b from-cyan-500/10 to-transparent backdrop-blur-xl border border-cyan-500/30 p-8 rounded-[2.5rem] relative group overflow-hidden animate-float">
            <div className="absolute top-0 right-0 p-4">
              <Award className="text-cyan-400 w-6 h-6 opacity-50" />
            </div>
            <div className="relative w-32 h-32 mb-6 mx-auto transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src={mentor.image} alt={mentor.name} className="relative w-full h-full rounded-full border-4 border-cyan-500/20 object-cover p-1" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{mentor.name}</h3>
              <p className="text-cyan-400 text-sm font-bold mb-6 uppercase tracking-[0.2em]">{mentor.role}</p>
              <div className="flex justify-center gap-4">
                <a 
                  href={mentor.links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 transition-all hover:scale-110"
                >
                  <Linkedin className="w-5 h-5 text-cyan-400" />
                </a>
                <a 
                  href={getGmailWebLink(mentor.links.mail)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 transition-all hover:scale-110"
                >
                  <Mail className="w-5 h-5 text-cyan-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl hover:border-white/20 transition-all group flex flex-col items-center">
              <div className={`relative w-20 h-20 mb-4 animate-float transition-transform duration-500 group-hover:scale-110`} style={{ animationDelay: `${idx * 0.2}s` }}>
                <div className="absolute inset-0 bg-white/5 rounded-full scale-110 group-hover:bg-cyan-500/10 transition-colors"></div>
                <img src={member.image} alt={member.name} className="relative w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover border border-white/10" />
              </div>
              <div className="text-center flex-grow">
                <h4 className="text-md font-bold mb-1 group-hover:text-cyan-400 transition-colors">{member.name}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-4 h-8 flex items-center justify-center leading-tight">
                  {member.role}
                </p>
                
                <div className="flex justify-center gap-3 pt-2 border-t border-white/5">
                  <a href={member.links.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  {member.links.linkedin && (
                    <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.links.instagram && (
                    <a href={member.links.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-500 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  <a 
                    href={getGmailWebLink(member.links.mail)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center py-8 border-t border-white/5">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            Built with <span className="text-red-500">❤️</span> by the CCC Development Wing
          </p>
        </div>
      </div>
    </div>
  );
}