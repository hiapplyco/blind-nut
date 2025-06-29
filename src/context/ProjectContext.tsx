import React, { createContext, useContext, ReactNode } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Project, CreateProjectInput } from '@/types/project';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  selectedProjectId: string | null;
  selectedProject: Project | undefined;
  setSelectedProjectId: (id: string | null) => void;
  createProject: (input: CreateProjectInput) => Promise<Project | null>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<boolean>;
  archiveProject: (projectId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const projectsData = useProjects();

  return (
    <ProjectContext.Provider value={projectsData}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}