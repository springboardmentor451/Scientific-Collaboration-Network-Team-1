import apiClient from '../api/client';
import type { User, UserUpdateRequest } from '../types';
import { UserRole } from '../types';
import { AuthService } from './authService';

export class UserService {
  static async getMe(): Promise<User> {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    return currentUser;
  }

  static async updateMe(data: UserUpdateRequest): Promise<User> {
    // const currentUser = await this.getMe();
    // const { data: updated } = await apiClient.patch<User>(`/users/${currentUser.user_id}`, data);
    const { data: updated } = await apiClient.patch<User>(`/users/me`, data);
    return updated;
  }

  static async deleteMe(): Promise<void> {
    // const currentUser = await this.getMe();
    await apiClient.delete(`/users/me`);
    await AuthService.logout({ refresh_token: localStorage.getItem("scn_refresh_token") || "" });
  }

  static async requestRoleChange(requestedRole: UserRole): Promise<{ message: string }> {
    // const currentUser = await this.getMe();

    if (requestedRole === UserRole.SYSTEM_ADMIN) {
      throw new Error("System admin role cannot be self-declared");
    }

    const { data } = await apiClient.post<{ message: string }>(
      // `/users/${currentUser.user_id}/request-role-change`,
      `/users/me/request-role-change`,
      { requested_role: requestedRole }
    );
    return data;
  }
}
