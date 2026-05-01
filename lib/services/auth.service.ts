import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models";
import { getSession, setSession, clearSession } from "@/lib/auth/session";
import type { UserPublic } from "@/lib/types";

// Simple password hash comparison for stub auth
// In production, use bcrypt
function verifyPassword(password: string, hash: string): boolean {
  // For the seeded stub, we use simple hashes
  return password === hash;
}

export async function login(
  email: string,
  password: string
): Promise<UserPublic | null> {
  await connectToDatabase();

  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    return null;
  }

  const isValid = verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  // Set session
  await setSession({
    userId: user._id.toString(),
  });

  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function logout(): Promise<void> {
  await clearSession();
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  await connectToDatabase();

  const user = await UserModel.findById(session.userId);

  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function requireAuth(): Promise<UserPublic> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
