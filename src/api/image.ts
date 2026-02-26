import { api } from './axios';
import type { ImageModelDto } from './types';

const IMAGE_URL = '/Image';

export const imageApi = {
  upload: (data: FormData) => api.upload<FormData, ImageModelDto>(`${IMAGE_URL}/upload`, data),
  ping: () => api.getList<string>(`${IMAGE_URL}/ping`), // Assuming ping returns a string message
  getAll: () => api.getList<ImageModelDto>(IMAGE_URL),
  getById: (id: string | number) => api.getOne<ImageModelDto>(IMAGE_URL, id),
  create: (data: ImageModelDto) => api.create<ImageModelDto, ImageModelDto>(IMAGE_URL, data),
  update: (id: string | number, data: ImageModelDto) => api.update<ImageModelDto, ImageModelDto>(IMAGE_URL, id, data),
  remove: (id: string | number) => api.remove(IMAGE_URL, id),
};
