import axiosInstance from "./axios";
import type {
  PreviewSiteDto,
  PreviewSiteUpdateDto,
  Guid,
  PaginatedResponse,
  PreviewSiteListParams,
} from "../api/types";

const base = "/api/PreviewSites";

const fieldMapping: Record<string, string> = {
  contact_modal: "contactModal",
  no_images: "noImages",
  projects_data: "projects_Data",
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

const inverseMapping: Record<string, string> = Object.entries(fieldMapping).reduce(
  (acc, [frontendKey, backendKey]) => ({ ...acc, [backendKey]: frontendKey }),
  {}
);

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value) && !isFile(value);

export const mapToBackend = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(mapToBackend);
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const backendKey = fieldMapping[key] || key;
    mapped[backendKey] = mapToBackend(value);
  }

  return mapped;
};

export const mapFromBackend = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(mapFromBackend);
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const frontendKey = inverseMapping[key] || key;
    mapped[frontendKey] = mapFromBackend(value);
  }

  return mapped;
};

export const previewSitesApi = {
  list: (params?: PreviewSiteListParams) =>
    axiosInstance
      .get<PaginatedResponse<PreviewSiteDto>>(base, { params })
      .then((r) => ({
        ...r.data,
        items: r.data.items.map((item) => mapFromBackend(item) as PreviewSiteDto),
      })),

  get: (id: Guid) =>
    axiosInstance
      .get<PreviewSiteDto>(`${base}/${id}`)
      .then((r) => mapFromBackend(r.data) as PreviewSiteDto),

  create: (input: { slug: string; name?: string; description?: string }) =>
    axiosInstance
      .post<PreviewSiteDto>(base, mapToBackend(input))
      .then((r) => mapFromBackend(r.data) as PreviewSiteDto),

  update: (id: Guid, input: PreviewSiteUpdateDto) =>
    axiosInstance
      .patch<PreviewSiteDto>(`${base}/${id}`, mapToBackend(input) ?? {})
      .then((r) => mapFromBackend(r.data) as PreviewSiteDto),

  remove: (id: Guid) => axiosInstance.delete(`${base}/${id}`).then((r) => r.data),
};