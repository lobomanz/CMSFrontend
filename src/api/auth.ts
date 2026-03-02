import { api } from './axios';
import type { UserDto, RegisterDto } from './types';

export const authApi = {
  login: (username: string, password: string) => 
    api.create<UserDto, string>('/api/auth/login', { username, password }),
  
  register: (username: string, password: string) => {
    const registerData: RegisterDto = {
      username,
      password,
      confirmPassword: password,
      role: 'Basic',
      isActive: true,
    };
    return api.create<RegisterDto, void>('/api/auth/register', registerData);
  },
};
