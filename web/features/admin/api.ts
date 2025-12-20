import { api } from "@/lib/api/client";
import type {
  AdminStats,
  UsersListResponse,
  AdminUser,
  CreateUserDto,
  UpdateUserDto,
  ResetPasswordResponse,
} from "./types";

export async function getAdminStats(): Promise<AdminStats> {
  return api.get("api/admin/stats").json<AdminStats>();
}

export async function getUsers(
  skip = 0,
  take = 50
): Promise<UsersListResponse> {
  return api
    .get("api/admin/users", {
      searchParams: { skip: skip.toString(), take: take.toString() },
    })
    .json<UsersListResponse>();
}

export async function createUser(
  data: CreateUserDto
): Promise<AdminUser> {
  return api.post("api/admin/users", { json: data }).json<AdminUser>();
}

export async function updateUser(
  id: string,
  data: UpdateUserDto
): Promise<AdminUser> {
  return api.patch(`api/admin/users/${id}`, { json: data }).json<AdminUser>();
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return api.delete(`api/admin/users/${id}`).json<{ message: string }>();
}

export async function resetPassword(
  id: string,
  newPassword?: string
): Promise<ResetPasswordResponse> {
  return api
    .post(`api/admin/users/${id}/reset-password`, {
      json: { newPassword },
    })
    .json<ResetPasswordResponse>();
}

