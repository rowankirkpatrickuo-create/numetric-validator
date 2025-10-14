"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
import { useUser } from "@clerk/nextjs";

export function useIdentify() {
  const { user, isSignedIn } = useUser();
  useEffect(() => {
    if (!isSignedIn || !user) return;
    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      role: (user.publicMetadata as any)?.role,
      plan: (user.publicMetadata as any)?.plan,
    });
  }, [isSignedIn, user]);
}
