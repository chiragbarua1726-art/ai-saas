import mongoose from "mongoose";
import "dotenv/config";

// Models
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

const IntegrationsSchema = new mongoose.Schema(
  {
    crm: { type: Boolean, default: false },
    shopify: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    integrations: { type: IntegrationsSchema, default: () => ({ crm: false, shopify: false }) },
  },
  { timestamps: true }
);

const WidgetPositionSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  { _id: false }
);

const WidgetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["stats", "chart", "activity", "integrations"], required: true },
    title: { type: String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    position: { type: WidgetPositionSchema, required: true },
  },
  { _id: false }
);

const DashboardConfigSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    widgets: { type: [WidgetSchema], default: [] },
  },
  { timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "New Conversation" },
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model("DashboardConfig", DashboardConfigSchema);
const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.MONGODB_DB_NAME || "ai-saas";

  if (!MONGODB_URI) {
    console.error("MONGODB_URI environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB");

  // Clear existing data
  console.log("Clearing existing data...");
  await User.deleteMany({});
  await Project.deleteMany({});
  await DashboardConfig.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});

  // Create users (passwords are stored as plain text for demo - matching the stub auth)
  console.log("Creating users...");
  const adminUser = await User.create({
    email: "admin@example.com",
    name: "Admin User",
    passwordHash: "admin123", // Simple password for demo
    role: "admin",
  });

  const memberUser = await User.create({
    email: "member@example.com",
    name: "Member User",
    passwordHash: "member123", // Simple password for demo
    role: "member",
  });

  console.log("Users created:");
  console.log(`  - admin@example.com (password: admin123)`);
  console.log(`  - member@example.com (password: member123)`);

  // Create project
  console.log("Creating project...");
  const project = await Project.create({
    name: "Demo Project",
    slug: "demo-project",
    ownerId: adminUser._id,
    memberIds: [memberUser._id],
    integrations: {
      crm: true,
      shopify: false,
    },
  });

  console.log(`Project created: ${project.name}`);

  // Create dashboard config
  console.log("Creating dashboard config...");
  await DashboardConfig.create({
    projectId: project._id,
    widgets: [
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
    ],
  });

  console.log("Dashboard config created");

  // Create sample conversation
  console.log("Creating sample conversation...");
  const conversation = await Conversation.create({
    projectId: project._id,
    userId: adminUser._id,
    title: "Welcome Conversation",
  });

  await Message.create([
    {
      conversationId: conversation._id,
      role: "user",
      content: "Hello! What can you help me with?",
    },
    {
      conversationId: conversation._id,
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you with:\n\n• Analyzing your CRM data and customer insights\n• Tracking Shopify orders and inventory\n• Answering questions about your business\n• Providing recommendations based on your data\n\nWhat would you like to know?",
    },
  ]);

  console.log("Sample conversation created");

  console.log("\n✅ Seed completed successfully!");
  console.log("\nYou can now log in with:");
  console.log("  Admin: admin@example.com / admin123");
  console.log("  Member: member@example.com / member123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
