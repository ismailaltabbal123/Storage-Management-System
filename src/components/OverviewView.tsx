import React, { useEffect, useState } from 'react';
import { User, Product, CheckOutRecord } from '../types';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Package,
  ArrowRightLeft,
  History,
  Box
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface OverviewViewProps {
  user: User;
}

export default function OverviewView({ user }: OverviewViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<CheckOutRecord[]>([]);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await productService.getProducts();
      setProducts(productsData);
      const logsData = await productService.getLogs();
      setLogs(logsData);
      const usersData = await userService.getUsers();
      setUsersCount(usersData.length);
    };
    fetchData();
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const activeLoans = logs.filter(l => l.status === 'checked_out').length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Box, change: 'Types', trend: 'neutral' },
    { label: 'Units in Storage', value: totalStock, icon: Package, change: 'Stock', trend: 'up', color: 'text-primary-600' },
    { label: 'Active Issues', value: activeLoans, icon: ArrowRightLeft, change: 'Loaned', trend: 'down', color: 'text-amber-600' },
    { label: 'Total Users', value: usersCount, icon: Users, change: 'Active', trend: 'up' },
  ];

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="text-right">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">نظرة عامة على الخزنة</h1>
        <p className="text-slate-500">حالة المخزون: <span className="text-emerald-600 font-bold">متزامن</span>. تتبع الأصول في الوقت الفعلي نشط.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-right"
          >
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <stat.icon className={cn("h-5 w-5", stat.color || "text-slate-600")} />
              </div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                stat.trend === 'down' ? 'bg-amber-50 text-amber-600' : 
                'bg-slate-50 text-slate-500'
              }`}>
                {stat.change === 'Types' ? 'أنواع' : stat.change === 'Stock' ? 'مخزون' : stat.change === 'Loaned' ? 'إعارة' : 'نشط'}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                {stat.label === 'Total Products' ? 'إجمالي المنتجات' : 
                 stat.label === 'Units in Storage' ? 'الوحدات في المستودع' : 
                 stat.label === 'Active Issues' ? 'إعارات نشطة' : 'إجمالي المستخدمين'}
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Movements */}
        <div className="lg:col-span-2 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col text-right">
          <div className="flex items-center justify-between mb-8 flex-row-reverse">
            <h2 className="text-xl font-bold text-slate-900">آخر التحركات</h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <History className="h-4 w-4" />
              أحدث النشاطات
            </div>
          </div>
          <div className="space-y-6">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all flex-row-reverse">
                <div className={cn(
                  "h-10 w-10 flex-shrink-0 border rounded-full flex items-center justify-center",
                  log.status === 'checked_out' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                )}>
                  {log.status === 'checked_out' ? <ArrowUpRight className="h-5 w-5 text-amber-600" /> : <Activity className="h-5 w-5 text-emerald-600" />}
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-900 ml-2">{log.productName}</span> 
                    <span className="text-slate-400 mx-2">{log.status === 'checked_out' ? 'تم تسليمه لـ' : 'تمت إعادته بواسطة'}</span> 
                    <span className="font-bold text-slate-900">{log.username}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(log.checkOutDate).toLocaleString('ar-EG')}</p>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="py-20 text-center text-slate-600">
                <History className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p>لا يوجد نشاط مسجل بعد.</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Summary */}
        <div className="p-8 bg-primary-600 rounded-2xl text-white shadow-2xl shadow-primary-600/20 relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative justify-end">
            <h2 className="text-xl font-bold">مركز العهدة</h2>
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <p className="text-primary-100 text-sm mb-8 leading-relaxed relative">
            يمكن للأفراد المصرح لهم إصدار الأصول للمستخدمين العاديين. يتم تسجيل جميع التحركات في سجلات مشفرة لغرض التدقيق.
          </p>
          
          <div className="space-y-4 relative">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1 font-bold">حالة النظام</p>
              <p className="text-base font-bold">يعمل بكفاءة</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2 font-bold">توفر المخزون</p>
              <div className="flex items-center gap-3 flex-row-reverse">
                <p className="text-sm font-bold">{(products.filter(p => p.stock > 0).length / products.length * 100 || 0).toFixed(1)}%</p>
                <div className="flex-1 h-2 bg-primary-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${(products.filter(p => p.stock > 0).length / (products.length || 1) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

