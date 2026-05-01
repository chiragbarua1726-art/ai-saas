import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import { updateSessionProject } from "@/lib/auth/session";
import { canAccessProject } from "@/lib/access";
import { z } from "zod";

const UpdateProjectSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validatedData = UpdateProjectSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const hasAccess = await canAccessProject(
      user._id,
      validatedData.data.projectId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to project" },
        { status: 403 }
      );
    }

    await updateSessionProject(validatedData.data.projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update session project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
