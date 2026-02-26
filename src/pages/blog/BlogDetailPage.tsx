import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import type { BlogDto } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import JsonEditor from '../../components/ui/JsonEditor';
import Button from '../../components/ui/Button';

const BlogDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: blogData,
    isLoading,
    isError,
    error,
  } = useQuery<BlogDto, Error>({
    queryKey: ['blog', id],
    queryFn: () => blogApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    toast.error(`Error loading blog: ${error?.message}`);
    return <p className="text-red-500 text-center">Error loading blog: {error?.message}</p>;
  }

  if (!blogData) {
    return <p className="text-center text-gray-500">Blog entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blog Detail (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JsonEditor
            id="blogJsonView"
            value={blogData as unknown as Record<string, unknown>}
            onChange={() => {}} // Read-only view
            rows={15}
            className="bg-gray-50 p-3 rounded-md"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => navigate('/blogs')}>
              Back to List
            </Button>
            <Button onClick={() => navigate(`/blogs/${id}/edit`)}>
              Edit Blog
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogDetailPage;
