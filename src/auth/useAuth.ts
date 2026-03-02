import { create } from 'zustand';
import type { UserDto } from '../api/types';

export interface AuthState {
  token: string | null;
  user: UserDto | null;
  login: (token: string, user: UserDto) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('authToken') || null,
  user: JSON.parse(localStorage.getItem('authUser') || 'null'),
  login: (token: string, user: UserDto) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    set({ token: null, user: null });
  },
  isAuthenticated: () => !!get().token,
}));
