import { connectToDatabase } from "@/lib/db/mongodb";
import { DashboardConfigModel, type IDashboardConfig } from "@/lib/db/models";
import { canAccessProject } from "@/lib/access";
import type { DashboardConfig, Widget } from "@/lib/types";

function serializeConfig(config: IDashboardConfig): DashboardConfig {
  return {
    _id: config._id.toString(),
    projectId: config.projectId.toString(),
    widgets: config.widgets,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

// Default widgets for new projects
function getDefaultWidgets(): Widget[] {
  return [
    {
      id: "stats-1",
      type: "stats",
      title: "Total Conversations",
      config: { metric: "conversations", icon: "MessageSquare" },
      position: { x: 0, y: 0, w: 1, h: 1 },
    },
    {
      id: "stats-2",
      type: "stats",
      title: "Active Users",
      config: { metric: "users", icon: "Users" },
      position: { x: 1, y: 0, w: 1, h: 1 },
    },
    {
      id: "stats-3",
      type: "stats",
      title: "Messages Today",
      config: { metric: "messages", icon: "Send" },
      position: { x: 2, y: 0, w: 1, h: 1 },
    },
    {
      id: "stats-4",
      type: "stats",
      title: "AI Responses",
      config: { metric: "responses", icon: "Bot" },
      position: { x: 3, y: 0, w: 1, h: 1 },
    },
    {
      id: "chart-1",
      type: "chart",
      title: "Activity Overview",
      config: { chartType: "area" },
      position: { x: 0, y: 1, w: 2, h: 2 },
    },
    {
      id: "activity-1",
      type: "activity",
      title: "Recent Activity",
      config: { limit: 5 },
      position: { x: 2, y: 1, w: 2, h: 2 },
    },
    {
      id: "integrations-1",
      type: "integrations",
      title: "Integration Status",
      config: {},
      position: { x: 0, y: 3, w: 4, h: 1 },
    },
  ];
}

export async function getDashboardConfig(
  projectId: string,
  userId: string
): Promise<DashboardConfig | null> {
  const hasAccess = await canAccessProject(userId, projectId);

  if (!hasAccess) {
    return null;
  }

  await connectToDatabase();

  let config = await DashboardConfigModel.findOne({ projectId });

  // Create default config if none exists
  if (!config) {
    config = await DashboardConfigModel.create({
      projectId,
      widgets: getDefaultWidgets(),
    });
  }

  return serializeConfig(config);
}

export async function updateDashboardConfig(
  projectId: string,
  userId: string,
  widgets: Widget[]
): Promise<DashboardConfig | null> {
  const hasAccess = await canAccessProject(userId, projectId);

  if (!hasAccess) {
    throw new Error("No access to project");
  }

  await connectToDatabase();

  const config = await DashboardConfigModel.findOneAndUpdate(
    { projectId },
    { widgets },
    { new: true, upsert: true }
  );

  return serializeConfig(config);
}
