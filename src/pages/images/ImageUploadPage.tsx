import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { imageApi } from '../../api/image';
import type { ImageModelDto } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import FormField from '../../components/ui/FormField';

const ImageUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState<number | ''>('');

  const uploadImageMutation = useMutation<ImageModelDto, AxiosError, FormData>({
    mutationFn: imageApi.upload,
    onSuccess: (data) => {
      toast.success('Image uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['images'] });
      navigate(`/images/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to upload image: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSortOrder(value === '' ? '' : Number(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (sortOrder !== '') {
      formData.append('sortOrder', sortOrder.toString());
    }

    uploadImageMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Image File" htmlFor="imageFile">
              <Input
                id="imageFile"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              />
            </FormField>
            <FormField label="Sort Order (Optional)" htmlFor="sortOrder">
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={handleSortOrderChange}
                placeholder="e.g., 1, 2, 3"
              />
            </FormField>

            <Button
              type="submit"
              disabled={uploadImageMutation.isPending || !selectedFile}
              className="w-full"
            >
              {uploadImageMutation.isPending ? <Spinner size="sm" /> : 'Upload Image'}
            </Button>
            {uploadImageMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {uploadImageMutation.error?.response?.data?.message || uploadImageMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadPage;
