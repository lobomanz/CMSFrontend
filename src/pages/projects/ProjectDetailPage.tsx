import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../../api/project';
import type { ProjectDto } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import JsonEditor from '../../components/ui/JsonEditor';
import Button from '../../components/ui/Button';

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: projectData,
    isLoading,
    isError,
    error,
  } = useQuery<ProjectDto, Error>({
    queryKey: ['project', id],
    queryFn: () => projectApi.getById(id!),
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
    toast.error(`Error loading project: ${error?.message}`);
    return <p className="text-red-500 text-center">Error loading project: {error?.message}</p>;
  }

  if (!projectData) {
    return <p className="text-center text-gray-500">Project entry not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Detail (ID: {id})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JsonEditor
            id="projectJsonView"
            value={projectData}
            onChange={() => {}} // Read-only view
            rows={15}
            className="bg-gray-50 p-3 rounded-md"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => navigate('/projects')}>
              Back to List
            </Button>
            <Button onClick={() => navigate(`/projects/${id}/edit`)}>
              Edit Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
