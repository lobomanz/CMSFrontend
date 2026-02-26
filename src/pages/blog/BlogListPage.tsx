import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import type { BlogDto } from '../../api/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import { AxiosError } from 'axios';
import type { AboutUsDto, ApiError } from '../../api/types';


const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

  const {
    data: blogs,
    isLoading,
    isError,
    error,
  } = useQuery<BlogDto[], Error>({
    queryKey: ['blogs'],
    queryFn: blogApi.getAll,
  });

  const deleteBlogMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: blogApi.remove,
    onSuccess: () => {
      toast.success('Blog deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setIsModalOpen(false);
      setBlogToDelete(null);
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(`Failed to delete blog: ${err.response?.data?.message || err.message}`);
    },
  });

  const confirmDelete = (id: number) => {
    setBlogToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (blogToDelete !== null) {
      deleteBlogMutation.mutate(blogToDelete);
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
    return <p className="text-red-500 text-center">Error loading blogs: {error?.message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blogs</CardTitle>
          <Button onClick={() => navigate('/blogs/create')}>Create New Blog</Button>
        </CardHeader>
        <CardContent>
          {blogs && blogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">{blog.id}</TableCell>
                    <TableCell>{blog.title || 'N/A'}</TableCell>
                    <TableCell>{blog.createdAt ? new Date(blog.createdAt as string).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/blogs/${blog.id}`)}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/blogs/${blog.id}/edit`)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(blog.id as number)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No blogs found.</p>
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
              disabled={deleteBlogMutation.isPending}
            >
              {deleteBlogMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this blog entry (ID: {blogToDelete})?</p>
      </Modal>
    </div>
  );
};

export default BlogListPage;
