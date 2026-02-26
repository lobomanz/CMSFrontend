import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api/blog';
import type { BlogDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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

const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormInputs>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const createBlogMutation = useMutation<BlogDto, AxiosError<ApiError>, BlogDto>({
    mutationFn: blogApi.create,
    onSuccess: (data) => {
      toast.success(`Blog entry created successfully with ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['blogs'] }); // Invalidate blog list
      navigate(`/blogs/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create blog entry: ${error.response?.data?.message || error.message}`);
    },
  });

  const onSubmit = (data: BlogFormInputs) => {
    createBlogMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Entry</CardTitle>
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
              disabled={isSubmitting || createBlogMutation.isPending}
              className="w-full"
            >
              {isSubmitting || createBlogMutation.isPending ? <Spinner size="sm" /> : 'Create Blog'}
            </Button>
            {createBlogMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {createBlogMutation.error?.response?.data?.message || createBlogMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogCreatePage;
