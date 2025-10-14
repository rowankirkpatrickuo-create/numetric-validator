"use client";
import { useUser } from "@clerk/nextjs";

export function RoleBanner() {
  const { user, isSignedIn } = useUser();
  if (!isSignedIn) return null;
  const role = (user.publicMetadata as any)?.role ?? "student";
  const plan = (user.publicMetadata as any)?.plan ?? "free";
  return (
    <div className="mb-4 rounded-md border bg-white/70 px-3 py-2 text-sm">
      <span className="font-medium">Account:</span>{" "}
      role <code>{role}</code>, plan <code>{plan}</code>
    </div>
  );
}
