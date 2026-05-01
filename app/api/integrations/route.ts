import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth.service";
import { getSession } from "@/lib/auth/session";
import { getCRMData, getShopifyData } from "@/lib/services/integration.service";

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

    // Silence unused variable warning
    void user;

    const [crmData, shopifyData] = await Promise.all([
      getCRMData(session.projectId),
      getShopifyData(session.projectId),
    ]);

    return NextResponse.json({
      crm: crmData,
      shopify: shopifyData,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get integration data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
