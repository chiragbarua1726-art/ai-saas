import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import { updateIntegrations } from "@/lib/services/project.service";
import { UpdateIntegrationsRequestSchema } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const validatedData = UpdateIntegrationsRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const project = await updateIntegrations(id, user._id, validatedData.data);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Only project admins")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Update integrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
