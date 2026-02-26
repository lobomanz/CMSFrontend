import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { imageApi } from '../../api/image';
import type { ImageModelDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

const ImageCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ImageModelDto>({ url: '' });
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const createImageMutation = useMutation<ImageModelDto, AxiosError<ApiError>, ImageModelDto>({
    mutationFn: imageApi.create,
    onSuccess: (data) => {
      toast.success(`Image metadata created successfully with ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['images'] }); // Invalidate any list/detail queries
      navigate(`/images/${data.id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(`Failed to create image metadata: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJsonChange = (value: Record<string, unknown>, isValid: boolean) => {
    setFormData(value as ImageModelDto);
    setIsJsonValid(isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJsonValid) {
      toast.error('Please correct the invalid JSON.');
      return;
    }
    createImageMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Image Metadata</CardTitle>
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
              disabled={createImageMutation.isPending || !isJsonValid}
              className="w-full"
            >
              {createImageMutation.isPending ? <Spinner size="sm" /> : 'Create Image Metadata'}
            </Button>
            {createImageMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {createImageMutation.error?.response?.data?.message || createImageMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCreatePage;
