import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imageApi } from '../../api/image';
import type { ImageModelDto } from '../../api/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import { AxiosError } from 'axios';

const ImageListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const {
    data: images,
    isLoading,
    isError,
    error,
  } = useQuery<ImageModelDto[], Error>({
    queryKey: ['images'],
    queryFn: imageApi.getAll,
  });

  const deleteImageMutation = useMutation<void, AxiosError, number>({
    mutationFn: imageApi.remove,
    onSuccess: () => {
      toast.success('Image deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setIsModalOpen(false);
      setImageToDelete(null);
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(`Failed to delete image: ${err.response?.data?.message || err.message}`);
    },
  });

  const confirmDelete = (id: number) => {
    setImageToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (imageToDelete !== null) {
      deleteImageMutation.mutate(imageToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500 text-center">Error loading images: {error?.message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Images</CardTitle>
          <div className="space-x-2">
            <Button onClick={() => navigate('/images/upload')}>Upload New Image</Button>
            <Button variant="secondary" onClick={() => navigate('/images/create')}>Create Image Metadata</Button>
          </div>
        </CardHeader>
        <CardContent>
          {images && images.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell className="font-medium">{image.id}</TableCell>
                    <TableCell>
                      {image.url || image.fileUrl || image.path ? (
                        <a href={(image.url || image.fileUrl || image.path) as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View
                        </a>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/images/${image.id}`)}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/images/${image.id}/edit`)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(image.id as number)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No images found.</p>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteImageMutation.isPending}
            >
              {deleteImageMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this image entry (ID: {imageToDelete})?</p>
      </Modal>
    </div>
  );
};

export default ImageListPage;
