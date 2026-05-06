import { User, UserRole } from '../types';

const CURRENT_USER_KEY = 'nexus_current_user';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  addUser: async (username: string, role: UserRole, password?: string): Promise<User> => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        role, 
        password,
        permissions: role === 'SUPER_ADMIN' ? 
          ['view_dashboard', 'manage_users', 'edit_roles', 'view_reports', 'system_settings'] : 
          ['view_dashboard']
      })
    });
    if (!res.ok) throw new Error('Failed to add user');
    return res.json();
  },

  updateUser: async (updatedUser: User): Promise<void> => {
    const res = await fetch(`/api/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    if (!res.ok) throw new Error('Failed to update user');
  },

  deleteUser: async (id: string): Promise<void> => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (username: string, password: string): Promise<User | null> => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
