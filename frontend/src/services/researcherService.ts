import apiClient from './api';
import { INITIAL_RESEARCHERS } from '../data/mockData';
import { ResearcherNode } from '../types';

export const researcherService = {
  async getResearchers(): Promise<ResearcherNode[]> {
    try {
      const response = await apiClient.get('/researchers');
      return response.data;
    } catch {
      // Fallback to mock data if backend isn't reached
      return INITIAL_RESEARCHERS;
    }
  },

  async getResearcherById(id: string): Promise<ResearcherNode | undefined> {
    try {
      const response = await apiClient.get(`/researchers/${id}`);
      return response.data;
    } catch {
      return INITIAL_RESEARCHERS.find((r) => r.id === id);
    }
  },
};
