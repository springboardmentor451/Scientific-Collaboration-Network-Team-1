import apiClient from '../api/client';
import type { Citation, CitationRequest } from '../types';

export class CitationService {
  static async create(payload: CitationRequest): Promise<Citation[]> {
    const { data } = await apiClient.post<Citation[]>('/citations', payload);
    return data;
  }

  static async getByPublication(publicationId: number): Promise<Citation[]> {
    const { data } = await apiClient.get<Citation[]>(`/citations/by-publication/${publicationId}`);
    return data;
  }

  static async getCitedBy(publicationId: number): Promise<Citation[]> {
    const { data } = await apiClient.get<Citation[]>(`/citations/cited-by/${publicationId}`);
    return data;
  }

  static async delete(citationId: number): Promise<void> {
    await apiClient.delete(`/citations/${citationId}`);
  }
}
