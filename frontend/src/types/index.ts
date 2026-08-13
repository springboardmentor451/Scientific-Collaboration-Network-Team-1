/**
 * SciConnect - TypeScript Interfaces
 */

export type UserRole = 'Researcher' | 'Institution Admin' | 'System Admin';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution: string;
  avatarUrl?: string;
  bio?: string;
  orcid?: string;
  domain?: string;
}

export interface ResearcherNode {
  id: string;
  dbId: number;
  name: string;
  role: UserRole;
  institution: string;
  domain: string;
  hIndex: number;
  citations: number;
  publicationsCount: number;
  x: number;
  y: number;
  color: string;
  email?: string;
  orcid?: string;
  bio?: string;
}

export interface CollaborationLink {
  source: string;
  target: string;
  weight: number; // number of co-authored papers
  jointProjects: number;
}

export interface ResearchProject {
  id: string;
  title: string;
  grantNumber: string;
  leadInstitution: string;
  domain: string;
  principalInvestigators: string[];
  fundingAmount: string;
  status: 'Active' | 'Completed' | 'Pending';
  startDate: string;
  endDate: string;
}

export interface InstitutionInfo {
  id: string;
  name: string;
  country: string;
  researcherCount: number;
  domainFocus: string;
  publicationsTotal: number;
  totalGrants: string;
  logoUrl?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  citations: number;
  doi: string;
  domain: string;
  abstract: string;
  pdfUrl?: string;
}

export interface AcademicConference {
  id: string;
  name: string;
  acronym: string;
  location: string;
  dates: string;
  deadline: string;
  domain: string;
  attendingResearchersCount: number;
  website: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'citation' | 'collaboration' | 'grant' | 'system';
}

export interface CitationMetric {
  year: number;
  citationsCount: number;
  hIndexTrend: number;
}
