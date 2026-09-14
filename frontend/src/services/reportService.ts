import apiClient from '../api/client';
import type { PublicationReportFilter, CollaborationReportFilter } from '../types';

export class ReportService {
  static async publicationReportCsv(filters: PublicationReportFilter): Promise<void> {
    const response = await apiClient.post('/reports/publications/csv', filters, { responseType: 'blob' });
    this.triggerDownload(response.data, 'publications.csv');
  }

  static async publicationReportJson(filters: PublicationReportFilter): Promise<void> {
    const response = await apiClient.post('/reports/publications/json', filters, { responseType: 'blob' });
    this.triggerDownload(response.data, 'publications.json');
  }

  static async collaborationReportCsv(filters: CollaborationReportFilter): Promise<void> {
    const response = await apiClient.post('/reports/collaborations/csv', filters, { responseType: 'blob' });
    this.triggerDownload(response.data, 'collaborations.csv');
  }

  private static triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
