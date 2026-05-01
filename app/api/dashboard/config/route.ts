import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import { getSession } from "@/lib/auth/session";
import {
  getDashboardConfig,
  updateDashboardConfig,
} from "@/lib/services/dashboard.service";
import { z } from "zod";
import { WidgetSchema } from "@/lib/types";

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

    const config = await getDashboardConfig(session.projectId, user._id);

    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get dashboard config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const session = await getSession();

    if (!session?.projectId) {
      return NextResponse.json(
        { error: "No project selected" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = z.array(WidgetSchema).safeParse(body.widgets);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const config = await updateDashboardConfig(
      session.projectId,
      user._id,
      validatedData.data
    );

    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "No access to project") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Update dashboard config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
