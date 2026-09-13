import apiClient from '../api/client';
import type { Researcher, ResearcherRequest, ResearcherUpdateRequest } from '../types';
import { AuthService } from './authService';

export class ResearcherService {
  static async getAll(): Promise<Researcher[]> {
    const { data } = await apiClient.get<Researcher[]>('/researchers');
    return data;
  }

  static async getById(researcherId: number): Promise<Researcher> {
    const { data } = await apiClient.get<Researcher>(`/researchers/${researcherId}`);
    return data;
  }

  // static async getByUserId(userId: number): Promise<Researcher | null> {
  //   const { data } = await apiClient.get<Researcher>(`/researchers/user/${userId}`);
  //   return data || null;
  // }

  static async getMyProfile(): Promise<Researcher | null> {
    try {
      const { data } = await apiClient.get<Researcher>('/researchers/me');
      return data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  static async create(payload: ResearcherRequest): Promise<Researcher> {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");

    const { data } = await apiClient.post<Researcher>('/researchers', {
      ...payload,
      user_id: currentUser.user_id
    });
    return data;
  }
  static async update(payload: ResearcherUpdateRequest): Promise<Researcher> {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");

    // const { data } = await apiClient.put<Researcher>(`/researchers/${currentUser.user_id}`, payload);
    const { data } = await apiClient.put<Researcher>(`/researchers/me`, payload);
    return data;
  }

  static async delete(): Promise<void> {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");

    // await apiClient.delete(`/researchers/${currentUser.user_id}`);
    await apiClient.delete(`/researchers/me`);
  }
}
