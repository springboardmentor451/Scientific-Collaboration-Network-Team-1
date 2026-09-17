import apiClient from '../api/client';
import type { Institution, Researcher, InstitutionStats } from '../types';

export class InstitutionAdminService {
    static async getMyInstitution(): Promise<Institution> {
        const { data } = await apiClient.get<Institution>('/institution-admin/my-institution');
        return data;
    }

    static async getMyResearchers(): Promise<Researcher[]> {
        const { data } = await apiClient.get<Researcher[]>('/institution-admin/my-researchers');
        return data;
    }

    static async getMyStats(): Promise<InstitutionStats> {
        const { data } = await apiClient.get<InstitutionStats>('/institution-admin/my-stats');
        return data;
    }
}
