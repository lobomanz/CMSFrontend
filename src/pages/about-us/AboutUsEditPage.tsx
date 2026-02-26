import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aboutUsApi } from '../../api/aboutUs';
import type { AboutUsDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';

const AboutUsEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AboutUsDto>({ content: {} });
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const {
    data: initialData,
    isLoading: isInitialLoading,
    isError: isInitialError,
    error: initialError,
  } = useQuery<AboutUsDto, Error>({
    queryKey: ['aboutUs', id],
    queryFn: () => aboutUsApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateAboutUsMutation = useMutation<AboutUsDto, AxiosError<ApiError>, { id: string, data: AboutUsDto }>({
    mutationFn: ({ id, data }) => aboutUsApi.update(id, data),
    onSuccess: () => {
      toast.success(`About Us entry with ID: ${id} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['aboutUs', id] });
      navigate(`/about-us/${id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(`Failed to update About Us entry: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJsonChange = (value: Record<string, unknown>, isValid: boolean) => {
    setFormData(value as unknown as AboutUsDto);
    setIsJsonValid(isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error('No ID provided for update.');
      return;
    }
    if (!isJsonValid) {
      toast.error('Please correct the invalid JSON.');
      return;
    }
    updateAboutUsMutation.mutate({ id, data: formData });
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isInitialError) {
    return <p className="text-red-500 text-center">Error loading About Us data: {initialError?.message}</p>;
  }

  if (!initialData) {
    return <p className="text-center text-gray-500">About Us entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit About Us Entry (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <JsonEditor
              id="aboutUsJsonEditor"
              label="About Us Data (JSON)"
              value={formData as unknown as Record<string, unknown>}
              onChange={handleJsonChange}
              rows={20}
            />
            <Button
              type="submit"
              disabled={updateAboutUsMutation.isPending || !isJsonValid}
              className="w-full"
            >
              {updateAboutUsMutation.isPending ? <Spinner size="sm" /> : 'Update About Us'}
            </Button>
            {updateAboutUsMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {updateAboutUsMutation.error?.response?.data?.message || updateAboutUsMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUsEditPage;
