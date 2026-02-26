import { api } from './axios';
import type { ContactInfoDto } from './types';

const CONTACT_INFO_URL = '/api/ContactInfo';

export const contactInfoApi = {
  get: () => api.getList<ContactInfoDto>(CONTACT_INFO_URL).then(res => res[0]), // Assuming it returns a single item in an array
  upsert: (data: ContactInfoDto) => api.create<ContactInfoDto, ContactInfoDto>(CONTACT_INFO_URL, data), // POST acts as upsert
};
