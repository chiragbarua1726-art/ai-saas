import { connectToDatabase } from "@/lib/db/mongodb";
import { ProjectModel, ConversationModel } from "@/lib/db/models";

/**
 * Check if a user can access a project (is owner or member)
 */
export async function canAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  await connectToDatabase();

  const project = await ProjectModel.findOne({
    _id: projectId,
    $or: [{ ownerId: userId }, { memberIds: userId }],
  });

  return !!project;
}

/**
 * Check if a user is an admin of a project (is owner)
 */
export async function isProjectAdmin(
  userId: string,
  projectId: string
): Promise<boolean> {
  await connectToDatabase();

  const project = await ProjectModel.findOne({
    _id: projectId,
    ownerId: userId,
  });

  return !!project;
}

/**
 * Check if a user can access a specific conversation
 */
export async function canAccessConversation(
  userId: string,
  conversationId: string
): Promise<boolean> {
  await connectToDatabase();

  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    userId: userId,
  });

  if (!conversation) return false;

  // Also verify user has access to the parent project
  return canAccessProject(userId, conversation.projectId.toString());
}

/**
 * Get user's role in a project
 */
export async function getUserProjectRole(
  userId: string,
  projectId: string
): Promise<"admin" | "member" | null> {
  await connectToDatabase();

  const project = await ProjectModel.findById(projectId);

  if (!project) return null;

  if (project.ownerId.toString() === userId) return "admin";

  if (project.memberIds.some((id) => id.toString() === userId)) return "member";

  return null;
}
