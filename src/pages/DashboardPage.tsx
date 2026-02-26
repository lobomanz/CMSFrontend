import React, { useState } from 'react';
import { useAuthStore } from '../auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useMutation } from '@tanstack/react-query';
import { imageApi } from '../api/image';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [pingResult, setPingResult] = useState<string | null>(null);

  const { mutate: ping, isPending: isPinging } = useMutation({
    mutationFn: imageApi.ping,
    onSuccess: (data: string) => {
      setPingResult(data);
      toast.success('Successfully pinged the image API!');
    },
    onError: (error: Error) => {
      setPingResult(`Error: ${error.message}`);
      toast.error('Failed to ping image API.');
    },
  });

  const handlePing = () => {
    ping();
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
          <Button onClick={handlePing} disabled={isPinging}>
            {isPinging ? <Spinner size="sm" /> : 'Ping Image API'}
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
