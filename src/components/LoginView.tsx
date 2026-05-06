import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { User } from '../types';
import { LogIn, Shield, User as UserIcon } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await userService.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 relative overflow-hidden" dir="rtl">
      {/* Decorative background logo */}
      <div className="absolute top-10 left-10 opacity-5 pointer-events-none hidden lg:block">
      </div>
      
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="z-10 w-full max-w-[420px] space-y-6">
        <div className="flex flex-col justify-center mb-6">
           <motion.img 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              src="/logo2.png" 
              className="h-24 md:h-15 object-contain mb-3" 
              alt="Logo" 
              onError={(e) => (e.currentTarget.style.display = 'none')}
           />
           <motion.img 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              src="/logo.png" 
              className="h-10 md:h-15 object-contain" 
              alt="Logo" 
              onError={(e) => (e.currentTarget.style.display = 'none')}
           />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-primary-500/5 relative overflow-hidden"
        >
          <div className="mb-10 text-center relative z-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">مخزن مكتب الأعلام</h1>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">نظام إدارة المخازن المركزية</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-right">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="username">
              اسم المستخدم
            </label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none transition-all text-right"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none transition-all text-right"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-500 text-right">{error === 'Invalid username or password' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : error}</p>
          )}

          <button
            type="submit"
            className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary-500 shadow-lg shadow-primary-500/20 active:scale-95 flex-row-reverse"
          >
            <span>تسجيل الدخول</span>
            <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </form>
      </motion.div>
    </div>
  </div>
  );
}
