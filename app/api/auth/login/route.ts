import { NextResponse } from "next/server";
import { LoginRequestSchema } from "@/lib/types";
import { login } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = LoginRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;
    const user = await login(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
