import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import { getSession } from "@/lib/auth/session";
import {
  getConversations,
  createConversation,
} from "@/lib/services/chat.service";
import { CreateConversationRequestSchema } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireAuth();
    const session = await getSession();

    if (!session?.projectId) {
      return NextResponse.json(
        { error: "No project selected" },
        { status: 400 }
      );
    }

    const conversations = await getConversations(session.projectId, user._id);

    return NextResponse.json({ conversations });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validatedData = CreateConversationRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const conversation = await createConversation(
      validatedData.data.projectId,
      user._id,
      validatedData.data.title
    );

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "No access to project") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
