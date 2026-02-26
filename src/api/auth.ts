import { api } from './axios';
import type { UserDto, RegisterDto, AuthResponse } from './types';

export const authApi = {
  login: (credentials: UserDto) => api.create<UserDto, AuthResponse>('/Auth/login', credentials),
  register: (userData: RegisterDto) => api.create<RegisterDto, any>('/api/Auth/register', userData),
  adminOnly: () => api.getList<any>('/Auth/admin-only'), // Assuming admin-only returns a simple message or status
};
