export interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  totalTags: number;
}

export interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
    tags: number;
  };
}

export interface UsersListResponse {
  users: AdminUser[];
  total: number;
  skip: number;
  take: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
}

export interface ResetPasswordResponse {
  newPassword?: string;
  message: string;
}

