import { z } from "zod";

// ============== User ==============
export const UserRoleSchema = z.enum(["admin", "member"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  name: z.string(),
  passwordHash: z.string(),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const UserPublicSchema = UserSchema.omit({ passwordHash: true });
export type UserPublic = z.infer<typeof UserPublicSchema>;

// ============== Project ==============
export const IntegrationsSchema = z.object({
  crm: z.boolean().default(false),
  shopify: z.boolean().default(false),
});

export type Integrations = z.infer<typeof IntegrationsSchema>;

export const ProjectSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  integrations: IntegrationsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

// ============== ProductInstance ==============
export const ProductInstanceSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  name: z.string(),
  config: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductInstance = z.infer<typeof ProductInstanceSchema>;

// ============== Conversation ==============
export const ConversationSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// ============== Message ==============
export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  _id: z.string(),
  conversationId: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

// ============== Dashboard Config ==============
export const WidgetTypeSchema = z.enum([
  "stats",
  "chart",
  "activity",
  "integrations",
]);
export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const WidgetSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  config: z.record(z.unknown()).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
});

export type Widget = z.infer<typeof WidgetSchema>;

export const DashboardConfigSchema = z.object({
  _id: z.string(),
  projectId: z.string(),
  widgets: z.array(WidgetSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;

// ============== API Request/Response Schemas ==============
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const CreateConversationRequestSchema = z.object({
  projectId: z.string(),
  title: z.string().optional(),
});

export type CreateConversationRequest = z.infer<
  typeof CreateConversationRequestSchema
>;

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const UpdateIntegrationsRequestSchema = IntegrationsSchema.partial();
export type UpdateIntegrationsRequest = z.infer<
  typeof UpdateIntegrationsRequestSchema
>;

// ============== Session ==============
export const SessionSchema = z.object({
  userId: z.string(),
  projectId: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;
