import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import { getProjectsByUser } from "@/lib/services/project.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const projects = await getProjectsByUser(user._id);

    return NextResponse.json({ projects });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
