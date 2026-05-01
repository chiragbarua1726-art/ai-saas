import { connectToDatabase } from "@/lib/db/mongodb";
import { ProjectModel, type IProject } from "@/lib/db/models";
import { canAccessProject, isProjectAdmin } from "@/lib/access";
import type { Project, Integrations } from "@/lib/types";

function serializeProject(project: IProject): Project {
  return {
    _id: project._id.toString(),
    name: project.name,
    slug: project.slug,
    ownerId: project.ownerId.toString(),
    memberIds: project.memberIds.map((id) => id.toString()),
    integrations: project.integrations,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  await connectToDatabase();

  const projects = await ProjectModel.find({
    $or: [{ ownerId: userId }, { memberIds: userId }],
  }).sort({ updatedAt: -1 });

  return projects.map(serializeProject);
}

export async function getProjectById(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const hasAccess = await canAccessProject(userId, projectId);

  if (!hasAccess) {
    return null;
  }

  await connectToDatabase();

  const project = await ProjectModel.findById(projectId);

  if (!project) {
    return null;
  }

  return serializeProject(project);
}

export async function updateIntegrations(
  projectId: string,
  userId: string,
  integrations: Partial<Integrations>
): Promise<Project | null> {
  // Only admins can update integrations
  const isAdmin = await isProjectAdmin(userId, projectId);

  if (!isAdmin) {
    throw new Error("Only project admins can update integrations");
  }

  await connectToDatabase();

  const project = await ProjectModel.findByIdAndUpdate(
    projectId,
    {
      $set: {
        "integrations.crm": integrations.crm,
        "integrations.shopify": integrations.shopify,
      },
    },
    { new: true }
  );

  if (!project) {
    return null;
  }

  return serializeProject(project);
}
