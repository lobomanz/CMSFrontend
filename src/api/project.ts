import { api } from './axios';
import type { ProjectDto } from './types';

const PROJECT_URL = '/Project';

export const projectApi = {
  getAll: () => api.getList<ProjectDto>(PROJECT_URL),
  getById: (id: string | number) => api.getOne<ProjectDto>(PROJECT_URL, id),
  create: (data: ProjectDto) => api.create<ProjectDto, ProjectDto>(PROJECT_URL, data),
  update: (id: string | number, data: ProjectDto) => api.update<ProjectDto, ProjectDto>(PROJECT_URL, id, data),
  remove: (id: string | number) => api.remove(PROJECT_URL, id),
};
