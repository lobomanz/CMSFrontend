import axiosInstance from "./axios";
import type {
  PreviewSiteDto,
  PreviewSiteUpdateDto,
  PaginatedResponse,
  PreviewSiteListParams,
} from "./types";

const base = "/api/PreviewSites";

/**
 * The backend expects specific camelCase/PascalCase naming for complex properties.
 * We normalize 'projects_data' to 'projects_Data' and 'contact_modal' to 'contactModal'
 * and ensure 'logoUrl' is handled.
 */
const mapToBackend = (data: PreviewSiteUpdateDto): Record<string, unknown> => {
  if (!data) return {};
  
  const mapped: Record<string, unknown> = { ...data } as Record<string, unknown>;

  // Normalize projects_data -> projects_Data (as named in C# DTO)
  if (mapped.projects_data) {
    mapped.projects_Data = mapped.projects_data;
    delete mapped.projects_data;
  }

  // Normalize contact_modal -> contactModal
  if (mapped.contact_modal) {
    mapped.contactModal = mapped.contact_modal;
    delete mapped.contact_modal;
  }
  
  return mapped;
};

/**
 * The backend returns JSON with camelCase properties by default.
 * We map 'projects_Data' and 'contactModal' back to our snake_case frontend names.
 */
const mapFromBackend = (data: Record<string, unknown>): PreviewSiteDto => {
  if (!data) return {} as PreviewSiteDto;

  const mapped = { ...data };

  // Handle PascalCase properties from backend if they exist
  if (mapped.projects_Data) {
    mapped.projects_data = mapped.projects_Data;
    delete mapped.projects_Data;
  } else if (mapped.projectsData) {
    mapped.projects_data = mapped.projectsData;
    delete mapped.projectsData;
  }
  
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

  get: (idOrSlug: string) =>
    axiosInstance
      .get<PreviewSiteDto>(`${base}/${idOrSlug}`)
      .then((r) => mapFromBackend(r.data as unknown as Record<string, unknown>)),

  create: (input: { slug: string; name?: string; logoUrl?: string }) =>
    axiosInstance
      .post<PreviewSiteDto>(base, mapToBackend(input as PreviewSiteUpdateDto))
      .then((r) => mapFromBackend(r.data as unknown as Record<string, unknown>)),

  update: (idOrSlug: string, input: PreviewSiteUpdateDto) =>
    axiosInstance
      .patch<PreviewSiteDto>(`${base}/${idOrSlug}`, mapToBackend(input))
      .then((r) => mapFromBackend(r.data as unknown as Record<string, unknown>)),

  remove: (idOrSlug: string) => axiosInstance.delete(`${base}/${idOrSlug}`).then((r) => r.data),
};
