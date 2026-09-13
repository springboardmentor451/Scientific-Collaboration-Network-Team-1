import apiClient from '../api/client';
import type { Citation, CitationRequest } from '../types';

export class CitationService {
  static async create(payload: CitationRequest): Promise<Citation[]> {
    // if (payload.cited_publication_ids.includes(payload.citing_publication_id)) {
    //   throw new Error("A publication cannot cite itself.");
    // }

    // const uniqueCitedIds: number[] = Array.from(new Set(payload.cited_publication_ids));
    // if (uniqueCitedIds.length !== payload.cited_publication_ids.length) {
    //   throw new Error("Duplicate cited publication IDs are not allowed.");
    // }

    // const { data } = await apiClient.post<Citation[]>('/citations', {
    //   ...payload,
    //   cited_publication_ids: uniqueCitedIds
    // });
    // return data;
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
