import axiosInstance from "./axios";
import type {
  PreviewSiteDto,
  PreviewSiteUpdateDto,
  Guid,
  PaginatedResponse,
  PreviewSiteListParams,
} from "../api/types";

const base = "/api/PreviewSites";

/**
 * The backend expects PascalCase for specific properties: 'Projects_Data' and 'ContactModal'.
 * Most other properties are camelCased by ASP.NET Core.
 */
const mapToBackend = (data: PreviewSiteUpdateDto): Record<string, unknown> => {
  if (!data) return {};
  
  const mapped: Record<string, unknown> = { ...data } as Record<string, unknown>;

  // 'projects_data' -> 'Projects_Data'
  if (mapped.projects_data) {
    mapped.Projects_Data = mapped.projects_data;
    delete mapped.projects_data;
  }

  // 'contact_modal' -> 'ContactModal'
  if (mapped.contact_modal) {
    mapped.ContactModal = mapped.contact_modal;
    delete mapped.contact_modal;
  }
  
  return mapped;
};

/**
 * The backend returns PascalCase for 'Projects_Data' and 'ContactModal'.
 * We map them to the snake_case names used in frontend types for consistency with existing code.
 */
const mapFromBackend = (data: Record<string, unknown>): PreviewSiteDto => {
  if (!data) return {} as PreviewSiteDto;

  const mapped = { ...data };

  // 'Projects_Data' -> 'projects_data'
  if (mapped.projects_Data) {
    mapped.projects_data = mapped.projects_Data;
    delete mapped.projects_Data;
  }
  
  // 'contactModal' or 'ContactModal' -> 'contact_modal'
  if (mapped.contactModal) {
    mapped.contact_modal = mapped.contactModal;
    delete mapped.contactModal;
  }

  return mapped as unknown as PreviewSiteDto;
};

export const previewSitesApi = {
  list: (params?: PreviewSiteListParams) =>
    axiosInstance
      .get<PaginatedResponse<PreviewSiteDto>>(base, { params })
      .then((r) => ({
        ...r.data,
        items: r.data.items.map((item) => mapFromBackend(item as unknown as Record<string, unknown>)),
      })),

  get: (id: Guid) =>
    axiosInstance
      .get<PreviewSiteDto>(`${base}/${id}`)
      .then((r) => mapFromBackend(r.data as unknown as Record<string, unknown>)),

  create: (input: { slug: string; name?: string }) =>
    axiosInstance
      .post<PreviewSiteDto>(base, mapToBackend(input as PreviewSiteUpdateDto))
      .then((r) => mapFromBackend(r.data as unknown as Record<string, unknown>)),

  update: (id: Guid, input: PreviewSiteUpdateDto) =>
    axiosInstance
      .patch<PreviewSiteDto>(`${base}/${id}`, mapToBackend(input))
      .then((r) => mapFromBackend(r.data as unknown as Record<string, unknown>)),

  remove: (id: Guid) => axiosInstance.delete(`${base}/${id}`).then((r) => r.data),
};
