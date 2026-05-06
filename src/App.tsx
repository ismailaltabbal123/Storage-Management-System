/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { userService } from './services/userService';
import { User } from './types';
import LoginView from './components/LoginView';
import DashboardLayout from './components/DashboardLayout';
import OverviewView from './components/OverviewView';
import UsersView from './components/UsersView';
import ProductsView from './components/ProductsView';
import LogisticsView from './components/LogisticsView';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'overview' | 'users' | 'storage' | 'logistics'>('overview');

  useEffect(() => {
    const session = userService.getCurrentUser();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && currentView === 'users' && user.role !== 'SUPER_ADMIN') {
      setCurrentView('overview');
    }
  }, [user, currentView]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    userService.logout();
    setUser(null);
    setCurrentView('overview');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary-500 selection:text-white relative overflow-hidden">
      {/* Soft Light Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginView onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-screen overflow-hidden"
            >
              <DashboardLayout 
                user={user} 
                onLogout={handleLogout}
                currentView={currentView}
                onViewChange={setCurrentView}
              >
                {currentView === 'overview' && <OverviewView user={user} />}
                {currentView === 'users' && isSuperAdmin && <UsersView user={user} />}
                {currentView === 'storage' && <ProductsView user={user} />}
                {currentView === 'logistics' && <LogisticsView user={user} />}
              </DashboardLayout>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
