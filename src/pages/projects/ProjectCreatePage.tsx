import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../../api/project';
import type { ProjectDto, ApiError } from '../../api/types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import JsonEditor from '../../components/ui/JsonEditor';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

const ProjectCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProjectDto>({ title: '', description: '' });
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);

  const createProjectMutation = useMutation<ProjectDto, AxiosError<ApiError>, ProjectDto>({
    mutationFn: projectApi.create,
    onSuccess: (data) => {
      toast.success(`Project entry created successfully with ID: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Invalidate any list/detail queries
      navigate(`/projects/${data.id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(`Failed to create project entry: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJsonChange = (value: Record<string, unknown>, isValid: boolean) => {
    setFormData(value as ProjectDto);
    setIsJsonValid(isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJsonValid) {
      toast.error('Please correct the invalid JSON.');
      return;
    }
    createProjectMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project Entry</CardTitle>
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
              disabled={createProjectMutation.isPending || !isJsonValid}
              className="w-full"
            >
              {createProjectMutation.isPending ? <Spinner size="sm" /> : 'Create Project'}
            </Button>
            {createProjectMutation.isError && (
              <p className="text-red-500 text-sm text-center">
                {createProjectMutation.error?.response?.data?.message || createProjectMutation.error?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCreatePage;
