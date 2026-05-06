export type UserRole = 'SUPER_ADMIN' | 'USER';

export interface UserPermission {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for security if we were filtering, but needed here for mock auth
  role: UserRole;
  permissions: string[]; // IDs of permissions
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  sku: string;
  description: string;
  updatedAt: string;
}

export interface CheckOutRecord {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  username: string;
  checkOutDate: string;
  returnDate?: string;
  status: 'checked_out' | 'returned';
}

export interface Notification {
  id: string;
  type: 'return' | 'issue';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const AVAILABLE_PERMISSIONS: UserPermission[] = [
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Can see general statistics' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can add, edit, and delete users' },
  { id: 'edit_roles', name: 'Edit Roles', description: 'Can change user roles and permissions' },
  { id: 'view_reports', name: 'View Reports', description: 'Can access analytical reports' },
  { id: 'system_settings', name: 'System Settings', description: 'Can modify global settings' },
];
