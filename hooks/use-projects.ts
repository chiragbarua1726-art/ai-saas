"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project, Integrations } from "@/lib/types";

export function useProjects() {
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      return data.projects;
    },
  });

  return {
    projects: projects || [],
    isLoading,
    error,
  };
}

export function useProject(projectId: string | null) {
  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      const data = await response.json();
      return data.project;
    },
    enabled: !!projectId,
  });

  return {
    project,
    isLoading,
    error,
  };
}

export function useUpdateIntegrations(projectId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (integrations: Partial<Integrations>) => {
      const response = await fetch(`/api/projects/${projectId}/integrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(integrations),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update integrations");
      }

      const data = await response.json();
      return data.project as Project;
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(["projects", projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    updateIntegrations: mutation.mutate,
    updateIntegrationsAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
