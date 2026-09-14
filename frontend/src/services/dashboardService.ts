import apiClient from '../api/client';
import type { ResearcherDashboard, InstitutionStats, SystemStats, PublicStats } from '../types';

export class DashboardService {
  static async getMyDashboard(): Promise<ResearcherDashboard> {
    const { data } = await apiClient.get<ResearcherDashboard>('/dashboard/me');
    return data;
  }

  static async getInstitutionStats(institutionId: number): Promise<InstitutionStats> {
    const { data } = await apiClient.get<InstitutionStats>(`/dashboard/institution/${institutionId}`);
    return data;
  }

  static async getSystemStats(): Promise<SystemStats> {
    const { data } = await apiClient.get<SystemStats>('/dashboard/system');
    return data;
  }

  static async getPublicStats(): Promise<PublicStats> {
    const { data } = await apiClient.get<PublicStats>('/dashboard/public');
    return data;
  }
}