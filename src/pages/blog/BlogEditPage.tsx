import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import type { BlogDto } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  // Add other fields as necessary, keeping them optional for now
});

type BlogFormInputs = z.infer<typeof blogSchema>;

const BlogEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: initialData,
    isLoading: isInitialLoading,
    isError: isInitialError,
    error: initialError,
  } = useQuery<BlogDto, Error>({
    queryKey: ['blog', id],
    queryFn: () => blogApi.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormInputs>({
    resolver: zodResolver(blogSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const updateBlogMutation = useMutation<BlogDto, AxiosError, { id: string, data: BlogDto }>({
    mutationFn: ({ id, data }) => blogApi.update(id, data),
    onSuccess: (data) => {
      toast.success(`Blog entry with ID: ${id} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['blog', id] }); // Invalidate specific blog
      queryClient.invalidateQueries({ queryKey: ['blogs'] }); // Invalidate blog list
      navigate(`/blogs/${id}`);
    },
    onError: (error) => {
      toast.error(`Failed to update blog entry: ${error.response?.data?.message || error.message}`);
    },
  });

  const onSubmit = (data: BlogFormInputs) => {
    if (!id) {
      toast.error('No ID provided for update.');
      return;
    }
    updateBlogMutation.mutate({ id, data });
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isInitialError) {
    return <p className="text-red-500 text-center">Error loading blog data: {initialError?.message}</p>;
  }

  if (!initialData) {
    return <p className="text-center text-gray-500">Blog entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Blog Entry (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Title" htmlFor="title" error={errors.title}>
              <Input id="title" {...register('title')} />
            </FormField>
            <FormField label="Content" htmlFor="content" error={errors.content}>
              <Textarea id="content" {...register('content')} rows={10} />
            </FormField>
            {/* Additional fields could go here */}

            <Button
              type="submit"
              disabled={isSubmitting || updateBlogMutation.isPending}
              className="w-full"
            >
              {isSubmitting || updateBlogMutation.isPending ? <Spinner size="sm" /> : 'Update Blog'}
            </Button>
            {updateBlogMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {updateBlogMutation.error?.response?.data?.message || updateBlogMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogEditPage;
