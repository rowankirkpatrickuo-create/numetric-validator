import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const user = await clerkClient.users.getUser(userId);
  const md = user.publicMetadata as Record<string, unknown>;

  if (!md?.role || !md?.plan) {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "student", plan: "free" },
    });
  }
  return NextResponse.json({ ok: true });
}
