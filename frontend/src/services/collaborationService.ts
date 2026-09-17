import apiClient from '../api/client';
import type { Collaboration, CollaborationRequest } from '../types';

export class CollaborationService {
  static async getAll(): Promise<Collaboration[]> {
    const { data } = await apiClient.get<Collaboration[]>('/collaborations');
    return data;
  }

  static async getMine(): Promise<Collaboration[]> {
    const { data } = await apiClient.get<Collaboration[]>('/collaborations/my');
    return data;
  }

  static async create(payload: CollaborationRequest): Promise<Collaboration> {
    if (payload.researcher_ids.length < 2) {
      throw new Error("Collaboration must involve at least 2 researchers.");
    }

    const uniqueIds: number[] = Array.from(new Set(payload.researcher_ids));
    if (uniqueIds.length !== payload.researcher_ids.length) {
      throw new Error("A researcher cannot collaborate with themselves.");
    }

    const { data } = await apiClient.post<Collaboration>('/collaborations', {
      ...payload,
      researcher_ids: uniqueIds
    });
    return data;
  }

  static async delete(collaborationId: number): Promise<void> {
    await apiClient.delete(`/collaborations/${collaborationId}`);
  }

  static async getByResearcher(researcherId: number): Promise<Collaboration[]> {
    const { data } = await apiClient.get<Collaboration[]>(`/collaborations/by-researcher/${researcherId}`);
    return data;
  }
}
