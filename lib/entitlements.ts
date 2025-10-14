// lib/entitlements.ts
import { auth } from "@clerk/nextjs/server";

export async function getSessionRole() {
  const { sessionClaims } = await auth();
  return (sessionClaims as any)?.metadata?.role ?? "student";
}

export async function requireRole(
  ...allowed: Array<"student" | "instructor" | "admin">
) {
  const role = await getSessionRole();
  if (!allowed.includes(role)) throw new Error("forbidden");
  return role;
}
