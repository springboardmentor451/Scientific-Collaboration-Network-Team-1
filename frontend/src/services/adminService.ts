import apiClient from '../api/client';
import type { User, Institution, InstitutionRequest, InstitutionUpdateRequest } from '../types';
import { UserRole, UserStatus } from '../types';

export class AdminService {
  static async getPendingUsers(): Promise<User[]> {
    const { data: users } = await apiClient.get<User[]>('/users/pending');
    return users.filter(u => u.status === UserStatus.PENDING || !u.is_verified);
  }

  static async getAllUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/all-users');
    return data;
  }

  static async approveUser(userId: number): Promise<User> {
    const { data } = await apiClient.post<User>(`/users/${userId}/approve`);
    return data;
  }

  static async rejectUser(userId: number): Promise<User> {
    const { data } = await apiClient.post<User>(`/users/${userId}/reject`);
    return data;
  }

  static async banUser(userId: number): Promise<User> {
    const { data } = await apiClient.post<User>(`/users/${userId}/ban`);
    return data;
  }

  static async changeUserRole(userId: number, newRole: UserRole): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${userId}/role`, { role: newRole });
    return data;
  }

  static async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  }

  static async getRoleChangeRequests(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users/role-change-requests');
    return data;
  }

  static async approveRoleChange(userId: number): Promise<User> {
    const { data } = await apiClient.post<User>(`/users/${userId}/approve-role-change`);
    return data;
  }

  static async getAllInstitutions(): Promise<Institution[]> {
    const { data } = await apiClient.get<Institution[]>('/institutions');
    return data;
  }

  static async getInstitutionById(id: number): Promise<Institution> {
    const { data } = await apiClient.get<Institution>(`/institutions/${id}`);
    return data;
  }

  static async createInstitution(payload: InstitutionRequest): Promise<Institution> {
    const { data } = await apiClient.post<Institution>('/institutions', payload);
    return data;
  }

  static async updateInstitution(id: number, payload: InstitutionUpdateRequest): Promise<Institution> {
    const { data } = await apiClient.put<Institution>(`/institutions/${id}`, payload);
    return data;
  }

  static async deleteInstitution(id: number): Promise<void> {
    await apiClient.delete(`/institutions/${id}`);
  }
}
