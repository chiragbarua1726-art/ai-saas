"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/lib/types";
import { useProjects } from "@/hooks/use-projects";

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projects: Project[];
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { projects, isLoading } = useProjects();
  const [currentProject, setCurrentProjectState] = useState<Project | null>(
    null
  );
  const queryClient = useQueryClient();

  // Set the first project as default when projects load
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProjectState(projects[0]);
    }
  }, [projects, currentProject]);

  const setCurrentProject = useCallback(
    async (project: Project | null) => {
      setCurrentProjectState(project);

      // Update session with new project
      if (project) {
        await fetch("/api/session/project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: project._id }),
        });

        // Invalidate project-scoped queries
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["integrations"] });
      }
    },
    [queryClient]
  );

  return (
    <ProjectContext.Provider
      value={{ currentProject, setCurrentProject, projects, isLoading }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useCurrentProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useCurrentProject must be used within a ProjectProvider");
  }
  return context;
}
