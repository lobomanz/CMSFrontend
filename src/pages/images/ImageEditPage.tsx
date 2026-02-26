import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imageApi } from '../../api/image';
import type { ImageModelDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';

const ImageEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ImageModelDto>({ url: '' });
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const {
    data: initialData,
    isLoading: isInitialLoading,
    isError: isInitialError,
    error: initialError,
  } = useQuery<ImageModelDto, Error>({
    queryKey: ['image', id],
    queryFn: () => imageApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateImageMutation = useMutation<ImageModelDto, AxiosError<ApiError>, { id: string, data: ImageModelDto }>({
    mutationFn: ({ id, data }) => imageApi.update(id, data),
    onSuccess: () => {
      toast.success(`Image metadata with ID: ${id} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['image', id] });
      queryClient.invalidateQueries({ queryKey: ['images'] });
      navigate(`/images/${id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(`Failed to update image metadata: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJsonChange = (value: Record<string, unknown>, isValid: boolean) => {
    setFormData(value as unknown as ImageModelDto);
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
    updateImageMutation.mutate({ id, data: formData });
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isInitialError) {
    return <p className="text-red-500 text-center">Error loading image data: {initialError?.message}</p>;
  }

  if (!initialData) {
    return <p className="text-center text-gray-500">Image entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Image Metadata (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <JsonEditor
              id="imageJsonEditor"
              label="Image Metadata (JSON)"
              value={formData as unknown as Record<string, unknown>}
              onChange={handleJsonChange}
              rows={20}
            />
            <Button
              type="submit"
              disabled={updateImageMutation.isPending || !isJsonValid}
              className="w-full"
            >
              {updateImageMutation.isPending ? <Spinner size="sm" /> : 'Update Image Metadata'}
            </Button>
            {updateImageMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {updateImageMutation.error?.response?.data?.message || updateImageMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageEditPage;
