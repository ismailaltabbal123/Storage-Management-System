import React, { useState, useEffect } from 'react';
import { User, CheckOutRecord } from '../types';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import * as XLSX from 'xlsx';
import { 
  ClipboardList, 
  Search, 
  Package, 
  User as UserIcon,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  X,
  History,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface LogisticsViewProps {
  user: User;
}

export default function LogisticsView({ user }: LogisticsViewProps) {
  const [logs, setLogs] = useState<CheckOutRecord[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  
  // Export filters
  const [exportUser, setExportUser] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const logsData = await productService.getLogs();
      setLogs(logsData);
      const usersData = await userService.getUsers();
      setUsersList(usersData);
    };
    init();
  }, []);

  const handleCheckIn = async (logId: string) => {
    await productService.checkIn(logId);
    const logsData = await productService.getLogs();
    setLogs(logsData);
  };

  const handleExport = () => {
    let filteredLogs = [...logs];

    // Filter by user
    if (exportUser !== 'all') {
      filteredLogs = filteredLogs.filter(l => l.userId === exportUser);
    }

    // Filter by date range
    if (startDate) {
      filteredLogs = filteredLogs.filter(l => new Date(l.checkOutDate) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredLogs = filteredLogs.filter(l => new Date(l.checkOutDate) <= end);
    }

    // Format for Excel
    const data = filteredLogs.map(l => ({
      'اسم المنتج': l.productName,
      'اسم المستخدم': l.username,
      'تاريخ الاستلام': new Date(l.checkOutDate).toLocaleString('ar-EG'),
      'تاريخ الإعادة': l.returnDate ? new Date(l.returnDate).toLocaleString('ar-EG') : 'قيد الإعارة',
      'الحالة': l.status === 'checked_out' ? 'قيد الإعارة' : 'تمت الإعادة',
      'معرف المنتج': l.productId,
      'معرف المستخدم': l.userId
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير التحركات");
    
    // Add right-to-left direction for the sheet
    if (!worksheet['!cols']) worksheet['!cols'] = [];
    worksheet['!dir'] = 'rtl';

    XLSX.writeFile(workbook, `تقرير_تحركات_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
    setIsExportModalOpen(false);
  };

  const activeLogs = logs.filter(l => l.status === 'checked_out');
  const historyLogs = logs.filter(l => l.status === 'returned');

  const filteredActive = activeLogs.filter(l => 
    l.productName.toLowerCase().includes(search.toLowerCase()) ||
    l.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHistory = historyLogs.filter(l => 
    l.productName.toLowerCase().includes(search.toLowerCase()) ||
    l.username.toLowerCase().includes(search.toLowerCase())
  );

  const currentLogs = activeTab === 'active' ? filteredActive : filteredHistory;

  return (
    <div className="space-y-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-right">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">سجلات الحركة</h1>
          <p className="text-sm text-slate-500">تتبع إصدار العناصر، والحاملين الحاليين، وحركة السجل التاريخي.</p>
        </div>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all active:scale-[0.98] w-fit flex-row-reverse"
        >
          <FileDown className="h-5 w-5" />
          تصدير التقرير (Excel)
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 flex-row-reverse">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-row-reverse">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex-row-reverse",
              activeTab === 'active' 
                ? "bg-white text-primary-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Clock className="h-4 w-4" />
            المعار حالياً ({activeLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex-row-reverse",
              activeTab === 'history' 
                ? "bg-white text-primary-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <History className="h-4 w-4" />
            السجل الكامل
          </button>
        </div>

        <div className="relative flex-1 group text-right w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث في السجلات حسب العنصر أو المستخدم..."
            className="w-full pr-12 pl-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm text-right"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-right">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">أصل العنصر</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">الحامل (العهدة)</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">الجدول الزمني</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">الحالة</th>
                {activeTab === 'active' && <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-left">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 mb-0.5">{log.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">المعرف: {log.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{log.username}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">UID: {log.userId.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2 text-xs text-slate-600 flex-row-reverse">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        <span>خروج: {new Date(log.checkOutDate).toLocaleString('ar-EG')}</span>
                      </div>
                      {log.returnDate && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 flex-row-reverse">
                          <CheckCircle2 className="h-3 w-3 text-primary-600" />
                          <span>عودة: {new Date(log.returnDate).toLocaleString('ar-EG')}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      log.status === 'checked_out' 
                        ? "bg-amber-50 text-amber-600" 
                        : "bg-emerald-50 text-emerald-600"
                    )}>
                      {log.status === 'checked_out' ? 'قيد الإعارة' : 'تمت الإعادة'}
                    </span>
                  </td>
                  {activeTab === 'active' && (
                    <td className="px-8 py-6 text-left">
                      {user.role === 'SUPER_ADMIN' ? (
                        <button 
                          onClick={() => handleCheckIn(log.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 border border-primary-100 rounded-xl text-xs font-bold hover:bg-primary-600 hover:text-white transition-all active:scale-95 flex-row-reverse"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          إعادة للمستودع
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">بانتظار المدير</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {currentLogs.length === 0 && (
            <div className="py-20 text-center">
              <ClipboardList className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">لم يتم العثور على سجلات لوجستية.</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportModalOpen(false)}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-row-reverse">
                <div className="flex items-center gap-3">
                  <FileDown className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-slate-900">تصدير تقرير Excel</h2>
                </div>
                <button 
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 text-right">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">اختيار المستخدم</label>
                  <select 
                    value={exportUser}
                    onChange={(e) => setExportUser(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary-500 appearance-none cursor-pointer text-right"
                  >
                    <option value="all">كل المستخدمين</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 text-right">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">من تاريخ</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">إلى تاريخ</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsExportModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleExport}
                    className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all active:scale-[0.98]"
                  >
                    إنشاء وتحميل الملف
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
