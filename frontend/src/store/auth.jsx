import { create } from 'zustand';
import AuthService from '../services/authService';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: localStorage.getItem('token') !== null,
  login: async (params) => {
    try {
      const data = await AuthService.login(params);
      set({ user: data.user, token: data.token, isLoggedIn: true });

      return data;
    } catch (err) {
      throw err;
    }
  },
  register: async (params) => {
    try {
      const data = await AuthService.register(params);
      set({ user: data.user, token: data.token, isLoggedIn: true });

      return data;
    } catch (err) {
      throw err;
    }
  },
  logout: () => set({ user: {}, token: '', isLoggedIn: false }),
  updateProfile: async (params) => {
    try {
      const data = await AuthService.updateProfile(params);
      set({ user: data });
    } catch (err) {
      throw err;
    }
  },
}));

export default useAuthStore;
