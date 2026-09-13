// import apiClient from '../api/client';
// import type { ResearcherDashboard, InstitutionStats, SystemStats, Researcher, Publication, Project, Collaboration, Citation, Institution, User } from '../types';

// export class DashboardService {
//   static async getResearcherDashboard(userId: number): Promise<ResearcherDashboard> {
//     const { data: researchers } = await apiClient.get<Researcher[]>('/researchers');
//     const researcher = researchers.find((r: Researcher) => r.user_id === userId);

//     if (!researcher) {
//       throw new Error("No researcher profile linked to this user account.");
//     }

//     const { data: publications } = await apiClient.get<Publication[]>('/publications');
//     const { data: projects } = await apiClient.get<Project[]>('/projects');
//     const { data: collaborations } = await apiClient.get<Collaboration[]>('/collaborations');
//     const { data: citations } = await apiClient.get<Citation[]>('/citations');

//     const researcherPublications = publications.filter((p: Publication) => p.researcher_ids?.includes(researcher.researcher_id));
//     const researcherProjects = projects.filter((p: Project) => p.researcher_ids?.includes(researcher.researcher_id));
//     const researcherCollabs = collaborations.filter((c: Collaboration) => c.researcher_ids.includes(researcher.researcher_id));
//     const byType: Record<string, number> = {};
//     const byStatus: Record<string, number> = {};
//     researcherPublications.forEach((p: Publication) => {
//       byType[p.publication_type] = (byType[p.publication_type] || 0) + 1;
//       byStatus[p.status] = (byStatus[p.status] || 0) + 1;
//     });
//     const activeProjects = researcherProjects.filter((p: Project) => p.status === 'active').length;
//     const completedProjects = researcherProjects.filter((p: Project) => p.status === 'completed').length;
//     const pubIds = researcherPublications.map((p: Publication) => p.publication_id);
//     const citationCount = citations.filter((c: Citation) => pubIds.includes(c.cited_publication_id)).length;

//     return {
//       researcher_id: researcher.researcher_id,
//       name: researcher.name,
//       publication_stats: {
//         total: researcherPublications.length,
//         by_type: byType,
//         by_status: byStatus
//       },
//       project_stats: {
//         total: researcherProjects.length,
//         active: activeProjects,
//         completed: completedProjects
//       },
//       collaboration_count: researcherCollabs.length,
//       citation_count: citationCount
//     };
//   }

//   static async getInstitutionStats(institutionId: number): Promise<InstitutionStats> {
//     const { data: institutions } = await apiClient.get<Institution[]>('/institutions');
//     const inst = institutions.find((i: Institution) => i.institution_id === institutionId);
//     if (!inst) throw new Error("Institution not found.");

//     const { data: researchers } = await apiClient.get<Researcher[]>('/researchers');
//     const researcherIds = researchers.filter((r: Researcher) => r.institution_id === institutionId).map(r => r.researcher_id);

//     const { data: publications } = await apiClient.get<Publication[]>('/publications');
//     const { data: projects } = await apiClient.get<Project[]>('/projects');

//     const instPublications = publications.filter((p: Publication) => p.researcher_ids?.some(id => researcherIds.includes(id)));
//     const activeProjects = projects.filter((p: Project) => p.status === 'active' && p.researcher_ids?.some(id => researcherIds.includes(id)));

//     return {
//       institution_id: institutionId,
//       name: inst.name,
//       total_researchers: researcherIds.length,
//       total_publications: instPublications.length,
//       active_projects: activeProjects.length
//     };
//   }

//   static async getSystemStats(): Promise<SystemStats> {
//     const { data: users } = await apiClient.get<User[]>('/users');
//     const { data: researchers } = await apiClient.get<Researcher[]>('/researchers');
//     const { data: institutions } = await apiClient.get<Institution[]>('/institutions');
//     const { data: publications } = await apiClient.get<Publication[]>('/publications');
//     const { data: projects } = await apiClient.get<Project[]>('/projects');
//     const { data: collaborations } = await apiClient.get<Collaboration[]>('/collaborations');
//     const { data: citations } = await apiClient.get<Citation[]>('/citations');

//     const pendingUsers = users.filter((u: User) => u.status === 'pending' || !u.is_verified).length;
//     const activeUsers = users.filter((u: User) => u.status === 'active').length;

//     return {
//       total_users: users.length,
//       pending_users: pendingUsers,
//       active_users: activeUsers,
//       total_researchers: researchers.length,
//       total_institutions: institutions.length,
//       total_publications: publications.length,
//       total_projects: projects.length,
//       total_collaborations: collaborations.length,
//       total_citations: citations.length
//     };
//   }
// }

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