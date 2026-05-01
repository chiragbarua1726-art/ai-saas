"use client";

import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { useCurrentProject } from "@/lib/providers/project-provider";
import { Empty } from "@/components/ui/empty";
import { FolderOpen } from "lucide-react";

export default function DashboardPage() {
  const { currentProject, isLoading } = useCurrentProject();

  if (!isLoading && !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty
          icon={FolderOpen}
          title="No project selected"
          description="Please select a project to view the dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your AI assistant activity.
        </p>
      </div>
      <DashboardGrid />
    </div>
  );
}
