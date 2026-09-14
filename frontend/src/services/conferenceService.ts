import apiClient from '../api/client';
import type { Conference, ConferenceRequest, ConferenceUpdateRequest } from '../types';

export class ConferenceService {
  static async getAll(): Promise<Conference[]> {
    const { data } = await apiClient.get<Conference[]>('/conferences');
    return data;
  }

  static async getById(conferenceId: number): Promise<Conference> {
    const { data } = await apiClient.get<Conference>(`/conferences/${conferenceId}`);
    return data;
  }
  static async create(payload: ConferenceRequest): Promise<Conference> {
    const { data } = await apiClient.post<Conference>('/conferences', payload);
    return data;
  }
  static async update(conferenceId: number, payload: ConferenceUpdateRequest): Promise<Conference> {
    const { data } = await apiClient.patch<Conference>(`/conferences/${conferenceId}`, payload);
    return data;
  }

  static async delete(conferenceId: number): Promise<void> {
    await apiClient.delete(`/conferences/${conferenceId}`);
  }
}
