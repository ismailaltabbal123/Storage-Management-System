import React, { useState, useEffect } from 'react';
import { User, UserRole, AVAILABLE_PERMISSIONS } from '../types';
import { userService } from '../services/userService';
import { 
  MoreVertical, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check,
  ShieldAlert,
  User as UserIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface UsersViewProps {
  user: User;
}

export default function UsersView({ user }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await userService.getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    await userService.addUser(newUsername, newRole, newPassword);
    const data = await userService.getUsers();
    setUsers(data);
    setIsAddModalOpen(false);
    setNewUsername('');
    setNewPassword('');
    setNewRole('USER');
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await userService.deleteUser(userToDelete);
      const data = await userService.getUsers();
      setUsers(data);
      setUserToDelete(null);
    }
  };

  const handleTogglePermission = async (targetUser: User, permId: string) => {
    const updatedPermissions = targetUser.permissions.includes(permId)
      ? targetUser.permissions.filter(id => id !== permId)
      : [...targetUser.permissions, permId];
    
    const updatedUser = { ...targetUser, permissions: updatedPermissions };
    await userService.updateUser(updatedUser);
    const data = await userService.getUsers();
    setUsers(data);
    if (editingUser?.id === targetUser.id) {
       setEditingUser(updatedUser);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl" dir="rtl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-right">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">المستخدمون</h1>
          <p className="text-sm text-slate-500">إدارة حسابات النظام وصلاحياته في الوقت الفعلي</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex-row-reverse w-full sm:w-auto justify-center"
        >
          <Plus className="h-5 w-5" />
          إضافة مستخدم جديد
        </button>
      </header>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-right">إجمالي المستخدمين</p>
          <p className="text-3xl font-bold text-slate-900 text-right">{users.length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-right shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-right">المديرين الخارقين</p>
          <p className="text-3xl font-bold text-primary-600 text-right">{users.filter(u => u.role === 'SUPER_ADMIN').length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-right shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-right">المستخدمين العاديين</p>
          <p className="text-3xl font-bold text-slate-500 text-right">{users.filter(u => u.role === 'USER').length}</p>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col text-right">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">تفاصيل المستخدم</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">الدور</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">الصلاحيات</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 mb-0.5">{u.username}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">المعرف: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      u.role === 'SUPER_ADMIN' 
                        ? "bg-primary-50 text-primary-600 border border-primary-100" 
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}>
                      {u.role === 'SUPER_ADMIN' ? 'مدير خارق' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="px-8 py-5" onClick={() => setEditingUser(u)}>
                    <div className="flex -space-x-2 overflow-hidden cursor-pointer flex-row-reverse">
                       {u.permissions.slice(0, 4).map((p, i) => (
                         <div key={i} className="h-6 w-6 rounded-full bg-primary-600 border-2 border-white group-hover:border-slate-50 text-[8px] font-bold flex items-center justify-center text-white transition-all ml-[-8px]">
                           {p.charAt(0).toUpperCase()}
                         </div>
                       ))}
                       {u.permissions.length > 4 && (
                         <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white text-[8px] font-bold flex items-center justify-center text-slate-500 transition-all ml-[-8px]">
                           +{u.permissions.length - 4}
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-left">
                    <div className="flex items-center justify-start gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-row-reverse">
                       <button 
                        onClick={() => setEditingUser(u)}
                        className="p-2 text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                       >
                         <Edit3 className="h-5 w-5" />
                       </button>
                       {u.id !== user.id && (
                         <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                         >
                           <Trash2 className="h-5 w-5" />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="mt-auto p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-widest flex-row-reverse transition-all">
           <span>عرض {users.length} حساب نظام نشط</span>
           <div className="flex gap-4 flex-row-reverse">
             <button className="hover:text-slate-900 transition-colors disabled:opacity-30" disabled>السابق</button>
             <button className="hover:text-slate-900 transition-colors">التالي</button>
           </div>
        </footer>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl z-[60] p-8 text-right"
            >
              <div className="flex items-center justify-between mb-8 flex-row-reverse">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">إضافة حساب جديد</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">اسم المستخدم</label>
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثلاً: system_audit"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">كلمة المرور</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">دور الحساب</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['USER', 'SUPER_ADMIN'].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewRole(role as UserRole)}
                        className={cn(
                          "px-4 py-3 rounded-2xl border text-sm font-bold transition-all",
                          newRole === role 
                            ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20" 
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {role === 'SUPER_ADMIN' ? 'مدير خارق' : 'مستخدم'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl text-sm font-bold hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
                  >
                    تأكيد المستخدم
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}

        {userToDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl z-[60] p-8 text-center"
            >
              <div className="h-16 w-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">تأكيد الحذف</h3>
              <p className="text-sm text-slate-500 mb-8 text-center">
                هل أنت متأكد أنك تريد حذف <span className="text-slate-900 font-bold ml-1">{users.find(u => u.id === userToDelete)?.username}</span>؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-500 shadow-xl shadow-rose-600/20 transition-all active:scale-95"
                >
                  حذف المستخدم
                </button>
              </div>
            </motion.div>
          </>
        )}

        {editingUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-hidden"
            />
            <motion.div 
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              className="fixed top-0 left-0 h-full w-full max-w-lg bg-white border-r border-slate-200 z-[60] flex flex-col shadow-2xl text-right"
            >
              <div className="p-10 border-b border-slate-200 flex items-center justify-between flex-row-reverse">
                <div>
                   <h3 className="text-2xl font-bold tracking-tight text-slate-900 line-clamp-1 text-right">إعدادات {editingUser.username}</h3>
                   <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mt-1 text-right">إدارة الهوية والامتيازات</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0">
                  <X className="h-7 w-7 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                <section>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5 block italic text-right">مستوى الوصول</label>
                  <div className="relative">
                    <select 
                      value={editingUser.role}
                      onChange={async (e) => {
                        const updated = { ...editingUser, role: e.target.value as UserRole };
                        await userService.updateUser(updated);
                        const data = await userService.getUsers();
                        setUsers(data);
                        setEditingUser(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer text-right pr-12"
                    >
                      <option value="USER" className="bg-white text-right">هوية مستخدم قياسي</option>
                      <option value="SUPER_ADMIN" className="bg-white text-right">حوكمة النظام (مدير خارق)</option>
                    </select>
                    <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-600 pointer-events-none" />
                  </div>
                </section>

                <section>
                   <div className="flex items-center justify-between mb-6 flex-row-reverse">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block italic">قدرات النظام</label>
                     <span className="text-[10px] font-bold text-primary-600">{editingUser.permissions.length} نشط</span>
                   </div>
                   <div className="space-y-4">
                      {AVAILABLE_PERMISSIONS.map(p => {
                         const isActive = editingUser.permissions.includes(p.id);
                         return (
                           <button
                             key={p.id}
                             onClick={() => handleTogglePermission(editingUser, p.id)}
                             className={cn(
                               "w-full text-right p-5 rounded-2xl border transition-all flex items-center justify-between group/perm flex-row-reverse",
                               isActive 
                                 ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/10" 
                                 : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                             )}
                           >
                             <div className="pl-4 text-right">
                               <p className="text-sm font-bold leading-tight">{p.name === 'Manage Users' ? 'إدارة المستخدمين' : p.name === 'Manage Storage' ? 'إدارة المخزن' : p.name === 'Issue Items' ? 'إصدار عناصر' : 'عرض السجلات'}</p>
                               <p className={cn(
                                 "text-[11px] mt-1 line-clamp-1 text-right",
                                 isActive ? "text-primary-100/70" : "text-slate-400 group-hover/perm:text-slate-500"
                               )}>
                                 {p.description === 'Full control over user accounts and roles' ? 'تحكم كامل في حسابات المستخدمين وأدوارهم' : 
                                  p.description === 'Register, edit and remove warehouse items' ? 'تسجيل وتعديل وإزالة عناصر المستودع' : 
                                  p.description === 'Authorize item issuance to other users' ? 'تصريح بإصدار العناصر للمستخدمين الآخرين' : 'مراقبة سجلات حركة المخزون'}
                               </p>
                             </div>
                             <div className={cn(
                               "h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center border ml-4",
                               isActive ? "bg-white/20 border-white/30" : "bg-white/5 border-slate-200"
                             )}>
                                {isActive && <Check className="h-3.5 w-3.5 text-white" />}
                             </div>
                           </button>
                         );
                       })}
                   </div>
                </section>
              </div>

              <div className="p-10 border-t border-slate-200 bg-slate-50">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="w-full py-5 bg-primary-600 text-white rounded-2xl font-bold shadow-xl hover:bg-primary-500 active:scale-100 transition-all text-center"
                >
                  مزامنة التعديلات
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
