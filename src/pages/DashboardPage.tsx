import React, { useState } from 'react';
import { useAuthStore } from '../auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { imageApi } from '../api/image';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [pingResult, setPingResult] = useState<string | null>(null);

  const {
    data: pingData,
    isLoading: isPingLoading,
    refetch: refetchPing,
  } = useQuery<string, Error>({
    queryKey: ['imagePing'],
    queryFn: imageApi.ping,
    enabled: false, // Don't run automatically
    onSuccess: (data) => setPingResult(data),
    onError: (error) => {
      setPingResult(`Error: ${error.message}`);
      toast.error('Failed to ping image API.');
    },
  });

  const handlePing = () => {
    refetchPing();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to CMS Admin, {user?.username || 'User'}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is your dashboard. Use the sidebar to navigate through the different sections of the CMS.</p>

          <h3 className="text-lg font-semibold">API Connectivity Test</h3>
          <p>Click the button below to test connectivity to the Image API endpoint.</p>
          <Button onClick={handlePing} disabled={isPingLoading}>
            {isPingLoading ? <Spinner size="sm" /> : 'Ping Image API'}
          </Button>
          {pingResult && (
            <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm">
              <p>Ping Result: {pingResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
