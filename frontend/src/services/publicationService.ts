import apiClient from '../api/client';
import type { Publication, PublicationRequest, PublicationUpdateRequest } from '../types';

export class PublicationService {
  static async getAll(): Promise<Publication[]> {
    const { data } = await apiClient.get<Publication[]>('/publications');
    return data;
  }

  static async getMine(): Promise<Publication[]> {
    const { data } = await apiClient.get<Publication[]>('/publications/my');
    return data;
  }

  static async getById(publicationId: number): Promise<Publication> {
    const { data } = await apiClient.get<Publication>(`/publications/${publicationId}`);
    return data;
  }

  static async create(payload: PublicationRequest): Promise<Publication> {
    const { data } = await apiClient.post<Publication>('/publications', payload);
    return data;
  }

  static async update(publicationId: number, payload: PublicationUpdateRequest): Promise<Publication> {
    const { data } = await apiClient.patch<Publication>(`/publications/${publicationId}`, payload);
    return data;
  }

  static async delete(publicationId: number): Promise<void> {
    await apiClient.delete(`/publications/${publicationId}`);
  }

  static async uploadFile(publicationId: number, file: File): Promise<Publication> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<Publication>(`/publications/${publicationId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  static async download(publicationId: number): Promise<Blob> {
    const response = await apiClient.get(`/publications/${publicationId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}
