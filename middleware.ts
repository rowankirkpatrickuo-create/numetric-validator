// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public (no auth redirect). API routes listed here will still do their own JSON auth checks.
const isPublicRoute = createRouteMatcher([
  // Site pages
  "/",
  "/app",
  "/help(.*)",
  "/pricing",
  "/edu",
  "/about",
  "/security",
  "/legal(.*)",
  "/changelog",
  "/sign-in(.*)",
  "/sign-up(.*)",

  // API endpoints that must return JSON (never HTML redirects)
  "/api/problems(.*)",
  "/api/sessions(.*)",
  "/api/validate(.*)",
  "/api/vision(.*)",
  "/api/chat",
]);

export default clerkMiddleware(async (auth, req) => {
  // Let public routes through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Gate everything else behind Clerk
  const { userId } = await auth();
  if (!userId) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// Keep Clerk's recommended matcher
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
