import { ReactNode, useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { productService } from '../services/productService';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Settings, 
  Bell, 
  ChevronRight,
  ShieldAlert,
  Box,
  ClipboardList,
  CheckCircle2,
  ArrowRightLeft,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { userService } from '../services/userService';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
  currentView: 'overview' | 'users' | 'storage' | 'logistics';
  onViewChange: (view: 'overview' | 'users' | 'storage' | 'logistics') => void;
}

export default function DashboardLayout({ 
  user, 
  onLogout, 
  children, 
  currentView, 
  onViewChange 
}: DashboardLayoutProps) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchNotis = async () => {
      try {
        const data = await productService.getNotifications();
        setNotifications(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotis();
    const interval = setInterval(fetchNotis, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleReadNotis = async () => {
    await productService.markNotificationsAsRead();
    const data = await productService.getNotifications();
    setNotifications(data);
    setIsNotiOpen(!isNotiOpen);
  };

  const navItems = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, permission: true },
    { id: 'storage', label: 'مخزون المستودع', icon: Box, permission: true },
    { id: 'logistics', label: 'سجلات الحركة', icon: ClipboardList, permission: true },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, permission: isSuperAdmin }
  ];

  const SidebarContent = () => (
    <>
      <div className="px-6 mb-8 flex flex-col items-center gap-2">
        <div className="w-full flex flex-col items-center justify-center overflow-hidden">
          <img 
            src="/logo.png" 
            alt="مكتب الإعلام" 
            className="w-full h-auto object-contain max-h-12"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.logo-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'logo-fallback text-center py-1';
                fallback.innerHTML = `
                  <div class="text-xs font-bold text-slate-900 font-arabic">مكتب الإعلام</div>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
        <span className="font-bold text-sm tracking-tight text-white mt-1">مخزن مكتب الأعلام</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.filter(item => item.permission).map(item => (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id as any);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
              currentView === item.id 
                ? "bg-primary-50 text-primary-600 shadow-sm" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all mt-4"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
        
      </nav>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-900 bg-slate-50" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 border-l border-slate-200 bg-white shadow-sm flex flex-col pt-6 z-20">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white border-l border-slate-200 shadow-2xl z-[101] flex flex-col pt-6 lg:hidden"
            >
              <div className="flex justify-end px-4 mb-2">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        <header className="h-20 border-b border-slate-200 px-4 md:px-8 flex items-center justify-between bg-white shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>


          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              <button 
                onClick={handleReadNotis}
                className="p-2 text-slate-500 hover:text-primary-600 transition-all relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 left-2 h-2 w-2 bg-primary-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotiOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotiOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-4 w-[calc(100vw-32px)] sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">التنبيهات</h3>
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest font-mono">
                           إجمالي {notifications.length}
                        </span>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-6 py-12 text-center text-slate-500">
                            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">لا توجد تنبيهات نشطة</p>
                          </div>
                        ) : (
                          Object.entries(
                            notifications.reduce((groups, n) => {
                              const date = new Date(n.createdAt).toLocaleDateString('ar-EG', { 
                                year: 'numeric', month: 'long', day: 'numeric' 
                              });
                              if (!groups[date]) groups[date] = [];
                              groups[date].push(n);
                              return groups;
                            }, {} as Record<string, Notification[]>)
                          ).map(([date, items]) => (
                            <div key={date} className="bg-white">
                              <div className="px-6 py-3 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 border-y border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{date}</span>
                              </div>
                              <div className="divide-y divide-slate-50">
                                {(items as Notification[]).map(n => (
                                  <div key={n.id} className="px-6 py-4 hover:bg-slate-50/50 transition-all cursor-default text-right group">
                                    <div className="flex items-start gap-4">
                                      <div className={cn(
                                        "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-110",
                                        n.type === 'return' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
                                      )}>
                                        {n.type === 'return' ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-slate-700 leading-relaxed font-bold">
                                          {n.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 justify-end">
                                          <span className="text-[10px] text-slate-400 font-bold font-mono">
                                            {new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                          <Clock className="h-3 w-3 text-slate-300" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-primary-600/20">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user.username}</p>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">
                  {user.role === 'SUPER_ADMIN' ? 'مدير خارق' : 'مستخدم'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
