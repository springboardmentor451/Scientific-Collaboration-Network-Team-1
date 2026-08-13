import React, { useState } from 'react';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResearcherDashboard from '../pages/ResearcherDashboard';
import InstitutionDashboard from '../pages/InstitutionDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ResearcherManagementPage from '../pages/ResearcherManagementPage';
import ResearcherProfilePage from '../pages/ResearcherProfilePage';
import PublicationManagementPage from '../pages/PublicationManagementPage';
import ProjectManagementPage from '../pages/ProjectManagementPage';
import ConferenceManagementPage from '../pages/ConferenceManagementPage';
import CollaborationManagementPage from '../pages/CollaborationManagementPage';
import CitationModulePage from '../pages/CitationModulePage';
import ReportsPage from '../pages/ReportsPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { ResearcherNode, ResearchProject } from '../types';
import { ActiveGlobalFilter } from '../components/ExportReportModal';

export default function AppRouter() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedResearcherId, setSelectedResearcherId] = useState<string>('r1');
  const [externalGraphSearch, setExternalGraphSearch] = useState<string>('');
  const [externalSelectedGraphNodeId, setExternalSelectedGraphNodeId] = useState<string | null>(null);
  const [activeGlobalFilter, setActiveGlobalFilter] = useState<ActiveGlobalFilter | null>(null);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectResearcherFromSearch = (r: ResearcherNode) => {
    setSelectedResearcherId(r.id);
    setExternalSelectedGraphNodeId(r.id);
    setActiveGlobalFilter({
      type: 'researcher',
      label: r.name,
      details: `${r.institution} • ${r.domain}`,
      targetResearcherId: r.id,
    });
    setActiveTab('collaboration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInstitutionFromSearch = (instName: string) => {
    setActiveGlobalFilter({
      type: 'institution',
      label: instName,
      details: 'Filtered by institutional faculty node link topology',
    });
    setActiveTab('collaboration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProjectFromSearch = (project: ResearchProject) => {
    setActiveGlobalFilter({
      type: 'project',
      label: project.title,
      details: `Grant #${project.grantNumber} • Lead: ${project.leadInstitution}`,
      investigators: project.principalInvestigators,
    });
    setActiveTab('collaboration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearchQuerySubmit = (query: string) => {
    setExternalGraphSearch(query);
  };

  const handleNavigateToProfile = (researcherId: string) => {
    setSelectedResearcherId(researcherId);
    setActiveTab('profile-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToGraph = (researcherId: string) => {
    setExternalSelectedGraphNodeId(researcherId);
    setActiveTab('collaboration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onSelectResearcher={handleSelectResearcherFromSearch}
        onSelectInstitution={handleSelectInstitutionFromSearch}
        onSelectProject={handleSelectProjectFromSearch}
        onGlobalSearchSubmit={handleGlobalSearchQuerySubmit}
      />

      {/* Navigation Links Bar */}
      <Sidebar activeTab={activeTab} onNavigate={handleNavigate} />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {activeTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {activeTab === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {activeTab === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
        
        {activeTab === 'dashboard-researcher' && (
          <ResearcherDashboard
            onNavigate={handleNavigate}
            onSelectResearcher={handleSelectResearcherFromSearch}
          />
        )}
        {activeTab === 'dashboard-institution' && (
          <InstitutionDashboard
            onNavigate={handleNavigate}
            onSelectInstitution={handleSelectInstitutionFromSearch}
          />
        )}
        {activeTab === 'dashboard-admin' && <AdminDashboard onNavigate={handleNavigate} />}

        {activeTab === 'collaboration' && (
          <CollaborationManagementPage
            externalSearchQuery={externalGraphSearch}
            externalSelectedNodeId={externalSelectedGraphNodeId}
            activeGlobalFilter={activeGlobalFilter}
            onClearGlobalFilter={() => setActiveGlobalFilter(null)}
            onNavigateToProfile={handleNavigateToProfile}
          />
        )}

        {activeTab === 'researchers' && (
          <ResearcherManagementPage
            onSelectResearcher={handleSelectResearcherFromSearch}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToGraph={handleNavigateToGraph}
          />
        )}

        {activeTab === 'profile-view' && (
          <ResearcherProfilePage
            researcherId={selectedResearcherId}
            onNavigateToGraph={handleNavigateToGraph}
            onNavigateToReports={() => handleNavigate('reports')}
          />
        )}

        {activeTab === 'publications' && <PublicationManagementPage />}
        {activeTab === 'projects' && <ProjectManagementPage />}
        {activeTab === 'conferences' && <ConferenceManagementPage />}
        {activeTab === 'citations' && <CitationModulePage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'notifications' && <NotificationsPage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'settings' && <SettingsPage />}

        {!['landing', 'login', 'register', 'forgot-password', 'dashboard-researcher', 'dashboard-institution', 'dashboard-admin', 'collaboration', 'researchers', 'profile-view', 'publications', 'projects', 'conferences', 'citations', 'reports', 'notifications', 'profile', 'settings'].includes(activeTab) && (
          <NotFoundPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
