import apiClient from '../api/client';
import type { Institution, InstitutionRequest, InstitutionUpdateRequest } from '../types';

export class InstitutionService {
    static async getAll(): Promise<Institution[]> {
        const { data } = await apiClient.get<Institution[]>('/institutions');
        return data;
    }

    static async getById(institutionId: number): Promise<Institution> {
        const { data } = await apiClient.get<Institution>(`/institutions/${institutionId}`);
        return data;
    }

    static async create(payload: InstitutionRequest): Promise<Institution> {
        const { data } = await apiClient.post<Institution>('/institutions', payload);
        return data;
    }

    static async update(institutionId: number, payload: InstitutionUpdateRequest): Promise<Institution> {
        const { data } = await apiClient.patch<Institution>(`/institutions/${institutionId}`, payload);
        return data;
    }

    static async delete(institutionId: number): Promise<void> {
        await apiClient.delete(`/institutions/${institutionId}`);
    }
}