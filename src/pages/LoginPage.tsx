import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/useAuth';
import { authApi } from '../api/auth';
import type { UserDto } from '../api/types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await authApi.login(data as UserDto);
      const { token } = response;
      // Assuming the API returns some user info along with the token,
      // or we can fetch it after successful login if needed.
      // For now, let's just store the username.
      login(token, { username: data.username });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message || 'Login failed. Please check your credentials.');
      } else {
        toast.error('An unexpected error occurred.');
      }
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              {...register('username')}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
