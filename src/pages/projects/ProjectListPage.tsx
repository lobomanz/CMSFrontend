import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../../api/project';
import type { ProjectDto } from '../../api/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import { AxiosError } from 'axios';

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery<ProjectDto[], Error>({
    queryKey: ['projects'],
    queryFn: projectApi.getAll,
  });

  const deleteProjectMutation = useMutation<void, AxiosError, number>({
    mutationFn: projectApi.remove,
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setProjectToDelete(null);
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(`Failed to delete project: ${err.response?.data?.message || err.message}`);
    },
  });

  const confirmDelete = (id: number) => {
    setProjectToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (projectToDelete !== null) {
      deleteProjectMutation.mutate(projectToDelete);
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
    return <p className="text-red-500 text-center">Error loading projects: {error?.message}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Button onClick={() => navigate('/projects/create')}>Create New Project</Button>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  {/* Add more project specific table heads here */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.id}</TableCell>
                    <TableCell>{project.title as string || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${project.id}/edit`)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(project.id as number)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No projects found.</p>
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
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this project entry (ID: {projectToDelete})?</p>
      </Modal>
    </div>
  );
};

export default ProjectListPage;
