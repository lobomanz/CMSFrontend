import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { imageApi } from '../../api/image';
import type { ImageModelDto } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import JsonEditor from '../../components/ui/JsonEditor';
import Button from '../../components/ui/Button';

const ImageDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: imageData,
    isLoading,
    isError,
    error,
  } = useQuery<ImageModelDto, Error>({
    queryKey: ['image', id],
    queryFn: () => imageApi.getById(id!),
    enabled: !!id,
  });

  const getImageUrl = (image: ImageModelDto) => {
    // Check for common URL fields
    if (typeof image.url === 'string' && image.url.startsWith('http')) return image.url;
    if (typeof image.fileUrl === 'string' && image.fileUrl.startsWith('http')) return image.fileUrl;
    if (typeof image.path === 'string' && image.path.startsWith('http')) return image.path;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    toast.error(`Error loading image: ${error?.message}`);
    return <p className="text-red-500 text-center">Error loading image: {error?.message}</p>;
  }

  if (!imageData) {
    return <p className="text-center text-gray-500">Image entry not found.</p>;
  }

  const imageUrl = getImageUrl(imageData);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Detail (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl && (
            <div className="flex justify-center mb-4">
              <img src={imageUrl} alt={`Image ${id}`} className="max-w-full h-auto max-h-96 object-contain border rounded-md" />
            </div>
          )}
          <JsonEditor
            id="imageJsonView"
            value={imageData}
            onChange={() => {}} // Read-only view
            rows={15}
            className="bg-gray-50 p-3 rounded-md"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => navigate('/images')}>
              Back to List
            </Button>
            <Button onClick={() => navigate(`/images/${id}/edit`)}>
              Edit Image Metadata
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageDetailPage;
