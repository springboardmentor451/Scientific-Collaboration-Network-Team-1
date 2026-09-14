import apiClient from '../api/client';
import type { Project, ProjectMemberRequest, ProjectMemberResponse, ProjectMemberUpdateRequest, ProjectRequest, ProjectUpdateRequest } from '../types';

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  }

  static async getMine(): Promise<Project[]> {
    const { data } = await apiClient.get<Project[]>('/projects/my');
    return data;
  }

  static async getById(projectId: number): Promise<Project> {
    const { data } = await apiClient.get<Project>(`/projects/${projectId}`);
    return data;
  }
  
  static async create(payload: ProjectRequest): Promise<Project> {
    if (payload.start_date && payload.end_date && new Date(payload.end_date) < new Date(payload.start_date)) {
      throw new Error("End date cannot be prior to start date.");
    }
    const { data } = await apiClient.post<Project>('/projects', payload);
    return data;
  }

  static async update(projectId: number, payload: ProjectUpdateRequest): Promise<Project> {
    if (payload.start_date && payload.end_date && new Date(payload.end_date) < new Date(payload.start_date)) {
      throw new Error("End date cannot be prior to start date.");
    }

    const { data } = await apiClient.patch<Project>(`/projects/${projectId}`, payload);
    return data;
  }

  static async delete(projectId: number): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  }

  static async addMember(projectId: number, payload: ProjectMemberRequest): Promise<ProjectMemberResponse> {
    const { data } = await apiClient.post<ProjectMemberResponse>(`/projects/${projectId}/members`, payload);
    return data;
  }

  static async updateMemberRole(projectId: number, researcherId: number, payload: ProjectMemberUpdateRequest): Promise<ProjectMemberResponse> {
    const { data } = await apiClient.patch<ProjectMemberResponse>(`/projects/${projectId}/members/${researcherId}`, payload);
    return data;
  }

  static async removeMember(projectId: number, researcherId: number): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/members/${researcherId}`);
  }
}
