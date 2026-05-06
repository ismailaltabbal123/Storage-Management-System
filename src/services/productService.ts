import { Product, CheckOutRecord, Notification } from '../types';

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  addProduct: async (product: Omit<Product, 'id' | 'updatedAt'>): Promise<Product> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to add product');
    return res.json();
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update product');
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  getLogs: async (): Promise<CheckOutRecord[]> => {
    const res = await fetch('/api/logs');
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },

  checkOut: async (productId: string, userId: string, username: string): Promise<void> => {
    const res = await fetch('/api/logs/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, userId, username })
    });
    if (!res.ok) throw new Error('Failed to checkout product');
  },

  checkIn: async (logId: string): Promise<void> => {
    const res = await fetch('/api/logs/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId })
    });
    if (!res.ok) throw new Error('Failed to checkin product');
  },

  getNotifications: async (): Promise<Notification[]> => {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  markNotificationsAsRead: async (): Promise<void> => {
    const res = await fetch('/api/notifications/read', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
  }
};
