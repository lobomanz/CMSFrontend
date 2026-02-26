import { api } from './axios';
import type { AboutUsDto } from './types';

const ABOUT_US_URL = '/api/AboutUs';

export const aboutUsApi = {
  getById: (id: string | number) => api.getOne<AboutUsDto>(ABOUT_US_URL, id),
  create: (data: AboutUsDto) => api.create<AboutUsDto, AboutUsDto>(ABOUT_US_URL, data),
  update: (id: string | number, data: AboutUsDto) => api.update<AboutUsDto, AboutUsDto>(ABOUT_US_URL, id, data),
  remove: (id: string | number) => api.remove(ABOUT_US_URL, id),
};
