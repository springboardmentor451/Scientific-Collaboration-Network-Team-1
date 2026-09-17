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
    const { data } = await apiClient.post<Researcher>('/researchers', payload);
    return data;
  }

  static async update(payload: ResearcherUpdateRequest): Promise<Researcher> {
    const { data } = await apiClient.patch<Researcher>(`/researchers/me`, payload);
    return data;
  }

  static async delete(): Promise<void> {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    await apiClient.delete(`/researchers/me`);
  }
}
