export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
  }
  
  export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
  }
  
  // Post types
  export interface Post {
    id: number;
    title: string;
    content: string;
    userId: number;
    date: string;
    status: 'draft' | 'published' | 'archived';
  }
  
  export interface CreatePostDto {
    title: string;
    content: string;
    status?: Post['status'];
  }
  
  export interface UpdatePostDto extends Partial<CreatePostDto> {
    id: number;
  }
  
  // User types
  export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    createdAt: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    user: User;
    token: string;
  }
  
  export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }