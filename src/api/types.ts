export interface ProjectDto {
  id?: number;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  sortOrder?: number;
  isPublished?: boolean;
  tags?: string[];
}

export interface BlogDto {
  id?: number;
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  isPublished?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface ImageModelDto {
  id?: number;
  url: string;
  fileUrl?: string;
  path?: string;
  altText?: string;
  sortOrder?: number;
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface AboutUsDto {
  id?: number;
  content: JsonValue;
}

export interface ContactInfoDto {
  id?: number;
  data: JsonValue;
}

export interface ApiError {
  message: string;
}

export interface UserDto {
  id?: string;
  username: string;
  password?: string;
}

export type UserRole = "Admin" | "Basic";

export interface RegisterDto {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
}

export type Guid = string;

export interface SiteConfigDto {
  [key: string]: string;
  name: string;
  email: string;
  phone: string;
}

export interface HeaderConfigDto {
  [key: string]: string;
  projects: string;
  about: string;
  contact: string;
}

export interface FooterConfigDto {
  [key: string]: string;
  contactUs: string;
  orAt: string;
  copyright: string;
}

export interface HomepageConfigDto {
  [key: string]: string | string[];
  noImages: string;
  images: string[];
}

export interface ContactModalConfigDto {
  [key: string]: string | string[];
  title: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  sendButton: string;
  images: string[];
}

export interface AboutConfigDto {
  [key: string]: string;
  heroTitle: string;
  heroImg: string;
  section1Title: string;
  section1Desc: string;
  section1Img: string;
  section2Title: string;
  section2Desc: string;
  section3Img: string;
  section3Title1: string;
  section3Desc1: string;
  section3Title2: string;
  section3Desc2: string;
}

export interface ProjectLabelsConfigDto {
  [key: string]: string;
  untitled: string;
}

export interface GalleryConfigDto {
  [key: string]: string;
  previous: string;
  next: string;
}

export interface MiniProjectDto {
  id?: Guid;
  externalId?: string;
  title: string;
  date?: string;
  thumbnailUrl?: string;
  galleryImageUrls: string[];
  textUrl?: string;
  sortOrder?: number;
}

export interface PreviewSiteDto {
  id: Guid;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  site: SiteConfigDto;
  header: HeaderConfigDto;
  footer: FooterConfigDto;
  homepage: HomepageConfigDto;
  contact_modal: ContactModalConfigDto;
  about: AboutConfigDto;
  project: ProjectLabelsConfigDto;
  gallery: GalleryConfigDto;
  months: string[];
  projects_data: Record<string, MiniProjectDto>;
  logoUrl?: string; // Still useful if needed
}

export interface PreviewSiteUpdateDto {
  name?: string;
  slug?: string;
  logoUrl?: string;
  site?: Partial<SiteConfigDto>;
  header?: Partial<HeaderConfigDto>;
  footer?: Partial<FooterConfigDto>;
  homepage?: Partial<HomepageConfigDto>;
  contact_modal?: Partial<ContactModalConfigDto>;
  about?: Partial<AboutConfigDto>;
  project?: Partial<ProjectLabelsConfigDto>;
  gallery?: Partial<GalleryConfigDto>;
  months?: string[];
  projects_data?: Record<string, MiniProjectDto>;
}

export interface PreviewSiteListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}