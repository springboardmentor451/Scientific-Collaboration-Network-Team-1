import React from 'react';
import NetworkGraph from '../components/NetworkGraph';
import { ActiveGlobalFilter } from '../components/ExportReportModal';

interface CollaborationManagementPageProps {
  externalSearchQuery?: string;
  externalSelectedNodeId?: string | null;
  activeGlobalFilter?: ActiveGlobalFilter | null;
  onClearGlobalFilter?: () => void;
  onNavigateToProfile?: (researcherId: string) => void;
}

export default function CollaborationManagementPage({
  externalSearchQuery,
  externalSelectedNodeId,
  activeGlobalFilter,
  onClearGlobalFilter,
  onNavigateToProfile,
}: CollaborationManagementPageProps) {
  return (
    <div className="space-y-6">
      <NetworkGraph
        externalSearchQuery={externalSearchQuery}
        externalSelectedNodeId={externalSelectedNodeId}
        activeGlobalFilter={activeGlobalFilter}
        onClearGlobalFilter={onClearGlobalFilter}
        onNavigateToProfile={onNavigateToProfile}
      />
    </div>
  );
}
