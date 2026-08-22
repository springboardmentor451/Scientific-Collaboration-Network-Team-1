import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

const initialResearchers = [
  {
    id: 'r1',
    name: 'Dr. Aris Thorne',
    role: 'Principal Investigator',
    department: 'Computer Science & AI',
    email: 'a.thorne@techinst.edu',
    hIndex: 42,
    citations: 12450,
    publicationsCount: 68,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Specializing in Graph Neural Networks and scalable AI architectures for scientific discovery.',
    orcId: '0000-0002-1825-0097',
  },
  {
    id: 'r2',
    name: 'Prof. Elena Rostova',
    role: 'Head of Bioinformatics',
    department: 'Bioinformatics & Genetics',
    email: 'e.rostova@techinst.edu',
    hIndex: 58,
    citations: 28900,
    publicationsCount: 112,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Pioneer in proteomic biomarker discovery and computational genomic mapping.',
    orcId: '0000-0001-9982-3341',
  },
  {
    id: 'r3',
    name: 'Dr. Marcus Vance',
    role: 'Senior Quantum Researcher',
    department: 'Quantum Physics',
    email: 'm.vance@techinst.edu',
    hIndex: 31,
    citations: 5410,
    publicationsCount: 41,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Focusing on fault-tolerant quantum algorithms and physical qubit error correction.',
    orcId: '0000-0003-4412-8810',
  },
];

const initialPublications = [
  {
    id: 'p1',
    title: 'Cross-Institutional Proteomic Data Mapping using Transformer Architectures',
    authors: ['Prof. Elena Rostova', 'Dr. Aris Thorne'],
    journal: 'Nature Biotechnology',
    year: 2024,
    citations: 310,
    doi: '10.1038/s41587-024-0012',
    field: 'Bioinformatics',
    abstract: 'We present a novel neural transformer approach for mapping large-scale cross-institutional proteomic datasets with minimal batch-effect noise.',
  },
  {
    id: 'p2',
    title: 'Scalable Graph Neural Networks for Large-Scale Scientific Network Analysis',
    authors: ['Dr. Aris Thorne'],
    journal: 'IEEE TPAMI',
    year: 2025,
    citations: 142,
    doi: '10.1109/TPAMI.2025.3091',
    field: 'Computer Science',
    abstract: 'An efficient distribution algorithm enabling billion-node graph neural network training on modern high-performance clusters.',
  },
  {
    id: 'p3',
    title: 'Fault-Tolerant Quantum Circuit Mapping on Scalable Processing Units',
    authors: ['Dr. Marcus Vance', 'Dr. Aris Thorne'],
    journal: 'ICQC Proceedings',
    year: 2024,
    citations: 89,
    doi: '10.1016/j.icqc.2024.102',
    field: 'Quantum Computing',
    abstract: 'Demonstrating dynamic error mitigation protocols during quantum circuit compilation for mid-scale NISQ hardware.',
  },
];

const initialConferences = [
  {
    id: 'c1',
    name: 'NeurIPS 2026 - Neural Information Processing Systems',
    acronym: 'NeurIPS',
    location: 'Vancouver, Canada',
    date: 'Dec 06 - Dec 12, 2026',
    status: 'Upcoming',
    role: 'Keynote & Presenters',
    field: 'AI & Machine Learning',
  },
  {
    id: 'c2',
    name: 'ISMB 2026 - Intelligent Systems for Molecular Biology',
    acronym: 'ISMB',
    location: 'Geneva, Switzerland',
    date: 'Jul 20 - Jul 24, 2026',
    status: 'Completed',
    role: 'Paper Presenters',
    field: 'Bioinformatics',
  },
];

export function DataProvider({ children }) {
  const [researchers, setResearchers] = useState(initialResearchers);
  const [publications, setPublications] = useState(initialPublications);
  const [conferences, setConferences] = useState(initialConferences);

 const [currentUser, setCurrentUser] = useState({
  name: "Dr. Harshithaa Sree",
  role: "Principal Investigator",
  email: "h.sree@techinst.edu",
  department: "Computer Science & AI",
  orcId: "0000-0002-1825-0097",
  bio: "Specializing in Graph Neural Networks and scalable AI architectures for scientific discovery.",
});

  const [selectedEntity, setSelectedEntity] = useState(null);

  const updateProfile = (updatedData) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedData }));
  };

  const openDetailModal = (type, data) => {
    setSelectedEntity({ type, data });
  };

  const closeDetailModal = () => {
    setSelectedEntity(null);
  };

  return (
    <DataContext.Provider
      value={{
        researchers,
        publications,
        conferences,
        currentUser,
        updateProfile,
        selectedEntity,
        openDetailModal,
        closeDetailModal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};