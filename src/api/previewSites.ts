import axiosInstance from "./axios";
import type {
  PreviewSiteDto,
  PreviewSiteUpdateDto,
  Guid,
  PaginatedResponse,
} from "../api/types";

const base = "/api/PreviewSites";

// Mapping dictionary for keys that don't follow standard camelCase or snake_case conventions
const fieldMapping: Record<string, string> = {
  contact_modal: "contactModal",
  no_images: "noImages",
  projects_data: "projects_Data", // Specific requirement
  contact_us: "contactUs",
  or_at: "orAt",
  name_placeholder: "namePlaceholder",
  email_placeholder: "emailPlaceholder",
  message_placeholder: "messagePlaceholder",
  send_button: "sendButton",
  hero_title: "heroTitle",
  hero_img: "heroImg",
  section1_title: "section1Title",
  section1_desc: "section1Desc",
  section1_img: "section1Img",
  section2_title: "section2Title",
  section2_desc: "section2Desc",
  section3_img: "section3Img",
  section3_title1: "section3Title1",
  section3_desc1: "section3Desc1",
  section3_title2: "section3Title2",
  section3_desc2: "section3Desc2",
  text_url: "textUrl",
};

// Inverse mapping for receiving data
const inverseMapping: Record<string, string> = Object.entries(fieldMapping).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k }),
  {}
);

/**
 * Recursively maps object keys from snake_case to camelCase (or custom mapping)
 */
export const mapToBackend = (data: any): any => {
  if (!data || typeof data !== "object" || data instanceof File) return data;
  if (Array.isArray(data)) return data.map(mapToBackend);

  const mapped: any = {};
  for (const key in data) {
    const backendKey = fieldMapping[key] || key;
    mapped[backendKey] = mapToBackend(data[key]);
  }
  return mapped;
};

/**
 * Recursively maps object keys from camelCase to snake_case (or custom inverse mapping)
 */
export const mapFromBackend = (data: any): any => {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(mapFromBackend);

  const mapped: any = {};
  for (const key in data) {
    const frontendKey = inverseMapping[key] || key;
    mapped[frontendKey] = mapFromBackend(data[key]);
  }
  return mapped;
};

export const previewSitesApi = {
  list: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
    axiosInstance
      .get<PaginatedResponse<PreviewSiteDto>>(base, { params })
      .then((r) => ({
        ...r.data,
        items: r.data.items.map(mapFromBackend),
      })),

  get: (id: Guid) =>
    axiosInstance
      .get<PreviewSiteDto>(`${base}/${id}`)
      .then((r) => mapFromBackend(r.data)),

  create: (input: { slug: string; name?: string; description?: string }) =>
    axiosInstance
      .post<PreviewSiteDto>(base, mapToBackend(input))
      .then((r) => mapFromBackend(r.data)),

  update: (id: Guid, input: PreviewSiteUpdateDto) =>
    axiosInstance
      .patch<PreviewSiteDto>(`${base}/${id}`, mapToBackend(input))
      .then((r) => mapFromBackend(r.data)),

  remove: (id: Guid) => axiosInstance.delete(`${base}/${id}`).then((r) => r.data),
};
