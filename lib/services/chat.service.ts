import { connectToDatabase } from "@/lib/db/mongodb";
import {
  ConversationModel,
  MessageModel,
  type IConversation,
  type IMessage,
} from "@/lib/db/models";
import { canAccessProject, canAccessConversation } from "@/lib/access";
import type { Conversation, Message } from "@/lib/types";

function serializeConversation(conversation: IConversation): Conversation {
  return {
    _id: conversation._id.toString(),
    projectId: conversation.projectId.toString(),
    userId: conversation.userId.toString(),
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function serializeMessage(message: IMessage): Message {
  return {
    _id: message._id.toString(),
    conversationId: message.conversationId.toString(),
    role: message.role,
    content: message.content,
    metadata: message.metadata,
    createdAt: message.createdAt,
  };
}

export async function createConversation(
  projectId: string,
  userId: string,
  title?: string
): Promise<Conversation> {
  const hasAccess = await canAccessProject(userId, projectId);

  if (!hasAccess) {
    throw new Error("No access to project");
  }

  await connectToDatabase();

  const conversation = await ConversationModel.create({
    projectId,
    userId,
    title: title || "New Conversation",
  });

  return serializeConversation(conversation);
}

export async function getConversations(
  projectId: string,
  userId: string
): Promise<Conversation[]> {
  const hasAccess = await canAccessProject(userId, projectId);

  if (!hasAccess) {
    throw new Error("No access to project");
  }

  await connectToDatabase();

  const conversations = await ConversationModel.find({
    projectId,
    userId,
  }).sort({ updatedAt: -1 });

  return conversations.map(serializeConversation);
}

export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  const hasAccess = await canAccessConversation(userId, conversationId);

  if (!hasAccess) {
    return null;
  }

  await connectToDatabase();

  const conversation = await ConversationModel.findById(conversationId);

  if (!conversation) {
    return null;
  }

  return serializeConversation(conversation);
}

export async function getMessages(
  conversationId: string,
  userId: string
): Promise<Message[]> {
  const hasAccess = await canAccessConversation(userId, conversationId);

  if (!hasAccess) {
    throw new Error("No access to conversation");
  }

  await connectToDatabase();

  const messages = await MessageModel.find({ conversationId }).sort({
    createdAt: 1,
  });

  return messages.map(serializeMessage);
}

export async function addMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: Record<string, unknown>
): Promise<Message> {
  const hasAccess = await canAccessConversation(userId, conversationId);

  if (!hasAccess) {
    throw new Error("No access to conversation");
  }

  await connectToDatabase();

  const message = await MessageModel.create({
    conversationId,
    role,
    content,
    metadata,
  });

  // Update conversation timestamp
  await ConversationModel.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });

  return serializeMessage(message);
}

export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
): Promise<Conversation | null> {
  const hasAccess = await canAccessConversation(userId, conversationId);

  if (!hasAccess) {
    throw new Error("No access to conversation");
  }

  await connectToDatabase();

  const conversation = await ConversationModel.findByIdAndUpdate(
    conversationId,
    { title },
    { new: true }
  );

  if (!conversation) {
    return null;
  }

  return serializeConversation(conversation);
}
