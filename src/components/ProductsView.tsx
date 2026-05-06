import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { 
  Plus, 
  Search, 
  Package, 
  Edit3, 
  Trash2, 
  X, 
  MoreVertical,
  Layers,
  DollarSign,
  Box,
  Hash,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ProductsViewProps {
  user: User;
}

export default function ProductsView({ user }: ProductsViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productToCheckOut, setProductToCheckOut] = useState<Product | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    sku: '',
    description: ''
  });

  const isAdmin = user.role === 'SUPER_ADMIN';

  useEffect(() => {
    const init = async () => {
      const prods = await productService.getProducts();
      setProducts(prods);
      const users = await userService.getUsers();
      setAvailableUsers(users.filter(u => u.id !== user.id));
    };
    init();
  }, [user.id]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    await productService.addProduct({
      name: formData.name,
      category: formData.category,
      stock: Number(formData.stock),
      sku: formData.sku,
      description: formData.description
    });
    
    const prods = await productService.getProducts();
    setProducts(prods);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingProduct) return;

    await productService.updateProduct(editingProduct.id, {
      name: formData.name,
      category: formData.category,
      stock: Number(formData.stock),
      sku: formData.sku,
      description: formData.description
    });

    const prods = await productService.getProducts();
    setProducts(prods);
    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = async () => {
    if (!isAdmin || !productToDelete) return;
    await productService.deleteProduct(productToDelete);
    const prods = await productService.getProducts();
    setProducts(prods);
    setProductToDelete(null);
  };

  const handleCheckOut = async () => {
    if (!productToCheckOut || !selectedUserId) return;
    const targetUser = availableUsers.find(u => u.id === selectedUserId);
    if (!targetUser) return;

    await productService.checkOut(productToCheckOut.id, targetUser.id, targetUser.username);
    const prods = await productService.getProducts();
    setProducts(prods);
    setProductToCheckOut(null);
    setSelectedUserId('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      stock: '',
      sku: '',
      description: ''
    });
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      stock: p.stock.toString(),
      sku: p.sku,
      description: p.description
    });
  };

  return (
    <div className="space-y-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-right">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">مخزون المستودع</h1>
          <p className="text-sm text-slate-500">إدارة الأصول المادية والرقمية في خزنة التخزين.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all active:scale-95 flex-row-reverse w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            إضافة عنصر جديد
          </button>
        )}
      </div>

      <div className="relative text-right">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="البحث بالاسم، الفئة، أو الرمز..."
          className="w-full pr-12 pl-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-right">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">تفاصيل المنتج</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">الفئة</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">المخزون</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="h-12 w-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-primary-600">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 mb-0.5">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-600">{p.category}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        p.stock > 20 ? "bg-emerald-500" : p.stock > 0 ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <span className="font-bold text-slate-900 ml-1">{p.stock}</span>
                      <span className="text-xs text-slate-400">وحدة</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-left">
                    <div className="flex items-center justify-start gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-row-reverse">
                      {isAdmin && p.stock > 0 && (
                        <button 
                          onClick={() => {
                            setProductToCheckOut(p);
                            if (availableUsers.length > 0) setSelectedUserId(availableUsers[0].id);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all active:scale-95 flex-row-reverse"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          تسليم
                        </button>
                      )}
                      
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => openEditModal(p)}
                            className="p-2 text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => setProductToDelete(p.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <Package className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">لم يتم العثور على عناصر تطابق بحثك.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isAddModalOpen || editingProduct) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl z-[60] overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-row-reverse">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct ? 'تعديل عنصر في المخزن' : 'تسجيل عنصر جديد'}
                </h2>
                <button 
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="p-8 space-y-6 text-right">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">اسم العنصر</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="مثلاً: معالج عصبي"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">رمز الـ SKU</label>
                    <input 
                      type="text" 
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="SKU-000"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">الفئة</label>
                    <input 
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="الأجهزة"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">الكمية</label>
                    <input 
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      placeholder="0"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all text-right"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">الوصف</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="شرح موجز للمواصفات..."
                      rows={3}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-primary-500 outline-none transition-all resize-none text-right"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                    className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-500 shadow-xl shadow-primary-600/20 transition-all active:scale-95"
                  >
                    {editingProduct ? 'حفظ التعديلات' : 'تأكيد التسجيل'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}

        {productToCheckOut && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToCheckOut(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl z-[60] p-8 text-center"
            >
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRightLeft className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">تسليم عهدة</h3>
              <p className="text-sm text-slate-500 mb-6">
                تأكيد تسليم <span className="text-slate-900 font-bold ml-1">{productToCheckOut.name}</span> لمستخدم معين.
              </p>
              
              <div className="space-y-2 text-right mb-8">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">المستلم المستهدف</label>
                <select 
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-5 py-3 bg-primary-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary-500 appearance-none cursor-pointer text-right"
                >
                  {availableUsers.length === 0 ? (
                    <option value="" disabled className="bg-white">لا يوجد مستخدمون متاحون</option>
                  ) : (
                    availableUsers.map(u => (
                      <option key={u.id} value={u.id} className="bg-white text-slate-900">
                        {u.username} ({u.role === 'SUPER_ADMIN' ? 'مدير' : 'مستخدم'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setProductToCheckOut(null); setSelectedUserId(''); }}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleCheckOut}
                  disabled={!selectedUserId}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تأكيد التسليم
                </button>
              </div>
            </motion.div>
          </>
        )}

        {productToDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-slate-500 mb-8">
                هل أنت متأكد أنك تريد إزالة <span className="text-slate-900 font-bold">{products.find(p => p.id === productToDelete)?.name}</span> من المخزون؟
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleDeleteProduct}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-500 shadow-xl shadow-rose-600/20 transition-all active:scale-95"
                >
                  حذف العنصر
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
