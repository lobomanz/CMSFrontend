import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../../api/project';
import type { ProjectDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';

const ProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProjectDto>({ title: '', description: '' });
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const {
    data: initialData,
    isLoading: isInitialLoading,
    isError: isInitialError,
    error: initialError,
  } = useQuery<ProjectDto, Error>({
    queryKey: ['project', id],
    queryFn: () => projectApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateProjectMutation = useMutation<ProjectDto, AxiosError<ApiError>, { id: string, data: ProjectDto }>({
    mutationFn: ({ id, data }) => projectApi.update(id, data),
    onSuccess: () => {
      toast.success(`Project entry with ID: ${id} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(`Failed to update project entry: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJsonChange = (value: Record<string, unknown>, isValid: boolean) => {
    setFormData(value as unknown as ProjectDto);
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
    updateProjectMutation.mutate({ id, data: formData });
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isInitialError) {
    return <p className="text-red-500 text-center">Error loading project data: {initialError?.message}</p>;
  }

  if (!initialData) {
    return <p className="text-center text-gray-500">Project entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Project Entry (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <JsonEditor
              id="projectJsonEditor"
              label="Project Data (JSON)"
              value={formData as unknown as Record<string, unknown>}
              onChange={handleJsonChange}
              rows={20}
            />
            <Button
              type="submit"
              disabled={updateProjectMutation.isPending || !isJsonValid}
              className="w-full"
            >
              {updateProjectMutation.isPending ? <Spinner size="sm" /> : 'Update Project'}
            </Button>
            {updateProjectMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {updateProjectMutation.error?.response?.data?.message || updateProjectMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectEditPage;
