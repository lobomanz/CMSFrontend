import { api } from './axios';
import type { BlogDto } from './types';

const BLOG_URL = '/api/Blog';

export const blogApi = {
  getAll: () => api.getList<BlogDto>(BLOG_URL),
  getById: (id: string | number) => api.getOne<BlogDto>(BLOG_URL, id),
  create: (data: BlogDto) => api.create<BlogDto, BlogDto>(BLOG_URL, data),
  update: (id: string | number, data: BlogDto) => api.update<BlogDto, BlogDto>(BLOG_URL, id, data),
  remove: (id: string | number) => api.remove(BLOG_URL, id),
};
