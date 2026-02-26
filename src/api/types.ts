export type AboutUsDto = Record<string, unknown> & { id?: number };
export type BlogDto = Record<string, unknown> & { id?: number; title?: string; content?: string; createdAt?: string };
export type ImageModelDto = Record<string, unknown> & { id?: number; url?: string; path?: string; fileUrl?: string };
export type ProjectDto = Record<string, unknown> & { id?: number };
export type ContactInfoDto = Record<string, unknown> & { id?: number };
export type UserDto = Record<string, unknown> & { id?: number; username?: string; password?: string };
export type RegisterDto = { username: string; password: string; confirmPassword: string };
export type AuthResponse = { token: string };
