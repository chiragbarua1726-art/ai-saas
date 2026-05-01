"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DashboardConfig, Widget } from "@/lib/types";

export function useDashboardConfig() {
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    error,
  } = useQuery<DashboardConfig>({
    queryKey: ["dashboard", "config"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/config");
      if (!response.ok) {
        if (response.status === 400) {
          // No project selected
          return null;
        }
        throw new Error("Failed to fetch dashboard config");
      }
      const data = await response.json();
      return data.config;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (widgets: Widget[]) => {
      const response = await fetch("/api/dashboard/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update dashboard config");
      }

      const data = await response.json();
      return data.config as DashboardConfig;
    },
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(["dashboard", "config"], updatedConfig);
    },
  });

  return {
    config,
    widgets: config?.widgets || [],
    isLoading,
    error,
    updateWidgets: updateMutation.mutate,
    updateWidgetsAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
