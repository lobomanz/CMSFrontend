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
  
  export interface AboutUsDto {
    id?: number;
    content: any; // JSON content
  }
  
  export interface ContactInfoDto {
    id?: number;
    data: any; // JSON content for contact info
  }
  
  export interface ApiError {
    message: string;
  }
  
  export interface UserDto {
    id?: string;
    username: string;
    password?: string;
  }
  
  export type UserRole = 'Admin' | 'Basic';

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
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MiniProjectSectionDto {
  heading: string;
  paragraph: string;
}

export interface MiniProjectDto {
  id: Guid;
  previewSiteId: Guid;
  title: string;
  sections: MiniProjectSectionDto[]; // exactly 3
  galleryImageUrls: string[];
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderMiniProjectsDto {
  projectId: Guid;
  sortOrder: number;
}