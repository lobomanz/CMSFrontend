import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

const AdminOnlyPage: React.FC = () => {
  const {
    data: adminStatus,
    isLoading,
    isError,
    error,
  } = useQuery<any, Error>({
    queryKey: ['adminOnly'],
    queryFn: authApi.adminOnly,
    // Add refetchOnWindowFocus: false if you only want to fetch once
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    toast.error(`Error checking admin status: ${error?.message}`);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Only Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-center">
            You do not have administrative access or an error occurred: {error?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Only Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 text-center text-lg font-semibold">
            You have successfully accessed the admin-only endpoint!
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">API Response:</h4>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(adminStatus, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOnlyPage;
