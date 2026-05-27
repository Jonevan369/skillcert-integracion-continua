import { create } from 'zustand';
import { api } from '../api/client.js';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('skillcert_user') || 'null'),
  token: localStorage.getItem('skillcert_token'),
  loading: false,
  async login(payload) {
    set({ loading: true });
    try {
      const result = await api.login(payload);
      localStorage.setItem('skillcert_token', result.token);
      localStorage.setItem('skillcert_user', JSON.stringify(result.user));
      set({ token: result.token, user: result.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async register(payload) {
    set({ loading: true });
    try {
      const result = await api.register(payload);
      localStorage.setItem('skillcert_token', result.token);
      localStorage.setItem('skillcert_user', JSON.stringify(result.user));
      set({ token: result.token, user: result.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  logout() {
    localStorage.removeItem('skillcert_token');
    localStorage.removeItem('skillcert_user');
    set({ token: null, user: null });
  },
  isAuthenticated() {
    return Boolean(get().token);
  }
}));
