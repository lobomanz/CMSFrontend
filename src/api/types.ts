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

export interface PreviewSiteDto {
  id: Guid;
  name?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  site?: JsonValue;
  header?: JsonValue;
  footer?: JsonValue;
  homepage?: JsonValue;
  contact_modal?: JsonValue;
  about?: JsonValue;
  project?: JsonValue;
  gallery?: JsonValue;
  months?: JsonValue;
  projects_data?: JsonValue;
}

export interface PreviewSiteUpdateDto {
  name?: string;
  slug?: string;
  description?: string;
  site?: JsonValue;
  header?: JsonValue;
  footer?: JsonValue;
  homepage?: JsonValue;
  contact_modal?: JsonValue;
  about?: JsonValue;
  project?: JsonValue;
  gallery?: JsonValue;
  months?: JsonValue;
  projects_data?: JsonValue;
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