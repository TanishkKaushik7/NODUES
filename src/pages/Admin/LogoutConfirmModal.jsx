import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LogoutConfirmModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth(); // ✅ Destructured from your AuthContext

  const handleLogout = () => {
    // Optional: Add a small delay for better UX feel
    logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 p-10 text-center"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon Wrapper */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 mb-8 border border-red-100 shadow-inner">
              <LogOut className="h-10 w-10 text-red-500" />
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">End Session?</h3>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              You are about to sign out of the <span className="font-bold text-slate-700">GBU Admin Portal</span>. 
              Any unsaved configuration changes may be lost.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-10">
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Sign Out Now
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:text-slate-800 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Minimalist Version Footer */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                Engine Status: Secure
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;