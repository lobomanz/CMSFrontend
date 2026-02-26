import React from 'react';
import { useAuthStore } from '../../auth/useAuth';
import Button from '../ui/Button';

const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-md">
      <div className="text-xl font-semibold">
        Welcome, {user?.username || 'Guest'}
      </div>
      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
    </header>
  );
};

export default Topbar;
