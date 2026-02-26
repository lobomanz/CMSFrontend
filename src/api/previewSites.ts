import axiosInstance from "./axios";
import type {
  PreviewSiteDto,
  MiniProjectDto,
  MiniProjectSectionDto,
  ReorderMiniProjectsDto,
  Guid,
} from "../api/types";

const base = "/PreviewSites"; // because your controller route is api/[controller] => /api/PreviewSites

function buildPreviewSiteFormData(input: {
  name?: string;
  slug?: string;
  description?: string;
  logoFile?: File | null;
}) {
  const fd = new FormData();
  if (input.name !== undefined) fd.append("Name", input.name);
  if (input.slug !== undefined) fd.append("Slug", input.slug);
  if (input.description !== undefined) fd.append("Description", input.description);
  if (input.logoFile) fd.append("Logo", input.logoFile);
  return fd;
}

// ASP.NET Core binder expects Sections[0].Heading, Sections[0].Paragraph etc.
function appendSections(fd: FormData, sections: MiniProjectSectionDto[]) {
  sections.forEach((s, idx) => {
    fd.append(`Sections[${idx}].Heading`, s.heading);
    fd.append(`Sections[${idx}].Paragraph`, s.paragraph);
  });
}

function buildMiniProjectFormData(input: {
  title?: string;
  sections?: MiniProjectSectionDto[]; // if provided, must be len 3
  galleryFiles?: File[];
  sortOrder?: number | null;
}) {
  const fd = new FormData();
  if (input.title !== undefined) fd.append("Title", input.title);

  if (input.sections !== undefined) {
    appendSections(fd, input.sections);
  }

  if (input.sortOrder !== undefined && input.sortOrder !== null) {
    fd.append("SortOrder", String(input.sortOrder));
  }

  if (input.galleryFiles?.length) {
    input.galleryFiles.forEach((f) => fd.append("GalleryFiles", f));
  }

  return fd;
}

export const previewSitesApi = {
  // PreviewSites
  list: (params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
    axiosInstance
      .get<PreviewSiteDto[]>(base, { params })
      .then((r) => r.data),

  get: (id: Guid) =>
    axiosInstance.get<PreviewSiteDto>(`${base}/${id}`).then((r) => r.data),

  create: (input: { name: string; slug: string; description?: string; logoFile?: File | null }) =>
    axiosInstance
      .post<PreviewSiteDto>(base, buildPreviewSiteFormData(input), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id: Guid, input: { name?: string; slug?: string; description?: string; logoFile?: File | null }) =>
    axiosInstance
      .patch<PreviewSiteDto>(`${base}/${id}`, buildPreviewSiteFormData(input), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  remove: (id: Guid) => axiosInstance.delete(`${base}/${id}`).then((r) => r.data),

  // MiniProjects (nested)
  listMiniProjects: (siteId: Guid, params?: { pageNumber?: number; pageSize?: number; searchTerm?: string }) =>
    axiosInstance
      .get<MiniProjectDto[]>(`${base}/${siteId}/mini-projects`, { params })
      .then((r) => r.data),

  getMiniProject: (siteId: Guid, projectId: Guid) =>
    axiosInstance
      .get<MiniProjectDto>(`${base}/${siteId}/mini-projects/${projectId}`)
      .then((r) => r.data),

  createMiniProject: (
    siteId: Guid,
    input: { title: string; sections: MiniProjectSectionDto[]; galleryFiles?: File[]; sortOrder?: number | null }
  ) =>
    axiosInstance
      .post<MiniProjectDto>(`${base}/${siteId}/mini-projects`, buildMiniProjectFormData(input), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  updateMiniProject: (
    siteId: Guid,
    projectId: Guid,
    input: { title?: string; sections?: MiniProjectSectionDto[]; galleryFiles?: File[]; sortOrder?: number | null }
  ) =>
    axiosInstance
      .patch<MiniProjectDto>(`${base}/${siteId}/mini-projects/${projectId}`, buildMiniProjectFormData(input), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  deleteMiniProject: (siteId: Guid, projectId: Guid) =>
    axiosInstance.delete(`${base}/${siteId}/mini-projects/${projectId}`).then((r) => r.data),

  reorderMiniProjects: (siteId: Guid, body: ReorderMiniProjectsDto[]) =>
    axiosInstance.patch(`${base}/${siteId}/mini-projects/reorder`, body).then((r) => r.data),
};