import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aboutUsApi } from '../../api/aboutUs';
import type { AboutUsDto } from '../../api/types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AboutUsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState<string>('');
  const [fetchId, setFetchId] = useState<string | null>(null);

  const {
    data: aboutUsData,
    isLoading,
    isError,
    error,
  } = useQuery<AboutUsDto, Error>({
    queryKey: ['aboutUs', fetchId],
    queryFn: () => aboutUsApi.getById(fetchId!),
    enabled: !!fetchId, // Only run the query if fetchId is not null
  });

  const handleLoad = () => {
    if (currentId) {
      setFetchId(currentId);
    } else {
      toast.error('Please enter an ID to load.');
    }
  };

  const handleEdit = () => {
    if (fetchId && aboutUsData) {
      navigate(`/about-us/${fetchId}/edit`);
    } else {
      toast.error('Load an About Us entry first to edit.');
    }
  };

  const handleDelete = async () => {
    if (!fetchId) {
      toast.error('No About Us entry loaded to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete About Us entry with ID: ${fetchId}?`)) {
      try {
        await aboutUsApi.remove(fetchId);
        toast.success('About Us entry deleted successfully!');
        setFetchId(null); // Clear loaded data after deletion
        setCurrentId('');
      } catch (err: any) {
        toast.error(`Failed to delete: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Us Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              id="aboutUsId"
              placeholder="Enter About Us ID"
              value={currentId}
              onChange={(e) => setCurrentId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleLoad} disabled={isLoading}>
              Load by ID
            </Button>
            <Button variant="secondary" onClick={() => navigate('/about-us/create')}>
              Create New
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          )}
          {isError && <p className="text-red-500 text-center">Error loading About Us: {error?.message}</p>}

          {aboutUsData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loaded Data for ID: {fetchId}</h3>
              <JsonEditor
                id="aboutUsJsonView"
                value={aboutUsData}
                onChange={() => {}} // Read-only view
                rows={15}
                className="bg-gray-50 p-3 rounded-md"
              />
              <div className="flex space-x-2">
                <Button onClick={handleEdit} className="flex-1">Edit</Button>
                <Button variant="destructive" onClick={handleDelete} className="flex-1">Delete</Button>
              </div>
            </div>
          )}
          {!fetchId && !isLoading && !isError && (
            <p className="text-center text-gray-500">Enter an ID above to load About Us details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUsDetailPage;
