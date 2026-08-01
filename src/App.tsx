import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import { Lock, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation & Authentication states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (passcode === 'ADMINMASTER') {
      setAdminToken('ADMINMASTER');
      setIsLoginModalOpen(false);
      setIsAdminOpen(true);
      setPasscode('');
    } else {
      setLoginError('كود المرور غير صحيح! يرجى المحاولة مرة أخرى.');
    }
  };

  const handleOpenAdminPortal = () => {
    if (adminToken === 'ADMINMASTER') {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    setAdminToken('');
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* If Admin view is open, render AdminPanel */}
      {isAdminOpen && adminToken === 'ADMINMASTER' ? (
        <AdminPanel 
          onClose={() => setIsAdminOpen(false)} 
          adminToken={adminToken}
          onLogout={handleLogout}
        />
      ) : (
        <LandingPage 
          onOpenAdmin={handleOpenAdminPortal} 
          isAdminLoggedIn={adminToken === 'ADMINMASTER'}
        />
      )}

      {/* Admin Login Modal Overlay */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full p-6 text-slate-800 relative border border-slate-100"
              dir="rtl"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                  setPasscode('');
                }}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-4">
                
                {/* Visual Icon Header */}
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock size={26} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">تسجيل دخول المسؤول</h3>
                  <p className="text-xs text-slate-400">يرجى إدخال كود المدير للولوج إلى لوحة إدارة الطلبات والمحتوى</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-4 text-right">
                  
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-700 block">كود المرور السري (Admin Passcode)</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="أدخل الكود هنا (ADMINMASTER)"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                        dir="ltr"
                      />
                      
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Errors */}
                  {loginError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-bold text-center">
                      ⚠️ {loginError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck size={16} />
                    <span>تأكيد الدخول 🔐</span>
                  </button>

                  <div className="text-center">
                    <span className="text-[10px] text-slate-400">تنويه: كود الدخول الافتراضي المعين من قبلك هو: <strong>ADMINMASTER</strong></span>
                  </div>

                </form>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
